import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { OAuth2Client } from "google-auth-library";

// Inicializamos DynamoDB. En AWS Lambda, esto detecta automáticamente tu Rol IAM.
const client = new DynamoDBClient({}); 
const docClient = DynamoDBDocumentClient.from(client);

// Tomamos el nombre de la tabla desde las variables de entorno de Terraform
const TABLE_NAME = process.env.DYNAMO_TABLE_NAME || "hito1-fdici12-app-data";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Función auxiliar para verificar roles y token
async function verifyUserRole(token) {
    if (!token) throw new Error("No token provided");
    const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const email = payload.email;

    if (!email.endsWith('@alumnos.ulagos.cl') && !email.endsWith('@ulagos.cl')) {
        throw new Error("Dominio no autorizado");
    }

    const adminCheck = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { id: `ADMIN#${email}` }
    }));
    
    let role = adminCheck.Item ? "admin" : "student";
    
    if (email === 'carlos.rojaslatorre@ulagos.cl') {
        role = "admin";
    }

    return {
        email,
        name: payload.name,
        picture: payload.picture,
        role
    };
}

export const handler = async (event) => {
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
        "Access-Control-Allow-Headers": "Content-Type,Authorization"
    };

    try {
        const method = event.requestContext?.http?.method || event.httpMethod;
        const path = event.rawPath || event.path;
        console.log(`[LOG] Recibida petición: ${method} ${path}`);

        if (method === "OPTIONS") {
            return { statusCode: 200, headers, body: JSON.stringify({ message: "CORS OK" }) };
        }

        if (method === "GET" && path === "/health") {
            return { statusCode: 200, headers, body: JSON.stringify({ status: "ok" }) };
        }

        // Obtener el token del header Authorization
        const authHeader = event.headers?.authorization || event.headers?.Authorization || "";
        const token = authHeader.replace("Bearer ", "");

        // --- RUTA: POST /api/auth/verify ---
        if (method === "POST" && path === "/api/auth/verify") {
            const body = JSON.parse(event.body || "{}");
            if (!body.token) return { statusCode: 400, headers, body: JSON.stringify({ error: "Token requerido" }) };
            
            try {
                const user = await verifyUserRole(body.token);
                return { statusCode: 200, headers, body: JSON.stringify({ role: user.role, user }) };
            } catch (err) {
                return { statusCode: 401, headers, body: JSON.stringify({ error: err.message }) };
            }
        }

        // --- RUTA: GET /api/reports/public --- (Todos los usuarios)
        if (method === "GET" && (path === "/api/reports/public" || path === "/api/reports")) {
            const queryParams = event.queryStringParameters || {};
            const subSector = queryParams.subSector;
            const sort = queryParams.sort || 'utility';

            const result = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
            let reports = result.Items || [];

            // Filtrar solo aprobados o en progreso (ignorar los que son ADMIN# o pendientes)
            reports = reports.filter(r => !r.id.startsWith("ADMIN#") && (r.estado === "aprobado" || r.estado === "en_progreso"));

            if (subSector) reports = reports.filter(r => r.subSector === subSector);

            reports.sort((a, b) => {
                if (sort === 'importance') return b.importance - a.importance;
                if (sort === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                return (b.utility || 0) - (a.utility || 0);
            });

            return { statusCode: 200, headers, body: JSON.stringify(reports) };
        }

        // --- RUTA protegida: GET /api/reports/admin ---
        if (method === "GET" && path === "/api/reports/admin") {
            try {
                const user = await verifyUserRole(token);
                if (user.role !== "admin") throw new Error("No admin");

                const result = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
                let reports = result.Items || [];
                // Admin ve todo menos lo resuelto (para poder gestionarlo)
                reports = reports.filter(r => !r.id.startsWith("ADMIN#") && !r.id.startsWith("LIKE#") && r.estado !== "resuelto");

                // Más antiguos primero
                reports.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                return { statusCode: 200, headers, body: JSON.stringify(reports) };
            } catch (err) {
                return { statusCode: 403, headers, body: JSON.stringify({ error: "Acceso denegado" }) };
            }
        }

        // --- RUTA protegida: POST /api/reports ---
        if (method === "POST" && path === "/api/reports") {
            try {
                const user = await verifyUserRole(token);
                const body = JSON.parse(event.body || "{}");
                const { subSector, title, description, imageUrl } = body;

                const newReport = {
                    id: uuidv4(),
                    subSector,
                    title,
                    description,
                    imageUrl: imageUrl || null,
                    createdAt: new Date().toISOString(),
                    utility: 0,
                    estado: "pendiente",
                    criticidad: "por_asignar",
                    createdBy: user.email
                };

                await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: newReport }));
                return { statusCode: 201, headers, body: JSON.stringify(newReport) };
            } catch (err) {
                return { statusCode: 401, headers, body: JSON.stringify({ error: "No autorizado para crear reportes" }) };
            }
        }

        // --- RUTA protegida: PUT /api/reports/:id/status ---
        const statusMatch = path.match(/^\/api\/reports\/([^\/]+)\/status$/);
        if (method === "PUT" && statusMatch) {
            try {
                const user = await verifyUserRole(token);
                if (user.role !== "admin") throw new Error("No admin");

                const reportId = statusMatch[1];
                const body = JSON.parse(event.body || "{}");
                const { estado, criticidad, subSector } = body;

                if (!estado || !criticidad) return { statusCode: 400, headers, body: JSON.stringify({ error: "Faltan datos" }) };

                let UpdateExpression = "SET estado = :e, criticidad = :c";
                let ExpressionAttributeValues = {
                    ":e": estado,
                    ":c": criticidad
                };

                if (subSector) {
                    UpdateExpression += ", subSector = :s";
                    ExpressionAttributeValues[":s"] = subSector;
                }

                const params = {
                    TableName: TABLE_NAME,
                    Key: { id: reportId },
                    UpdateExpression,
                    ExpressionAttributeValues,
                    ReturnValues: "ALL_NEW"
                };
                const result = await docClient.send(new UpdateCommand(params));
                return { statusCode: 200, headers, body: JSON.stringify(result.Attributes) };
            } catch (err) {
                return { statusCode: 403, headers, body: JSON.stringify({ error: "Acceso denegado" }) };
            }
        }

        // --- RUTA protegida: POST /api/reports/:id/like ---
        const likeMatch = path.match(/^\/api\/reports\/([^\/]+)\/like$/);
        if (method === "POST" && likeMatch) {
            try {
                const user = await verifyUserRole(token);
                const reportId = likeMatch[1]; 
                
                // 1. Intentar registrar el voto (falla si ya existe)
                try {
                    await docClient.send(new PutCommand({
                        TableName: TABLE_NAME,
                        Item: { id: `LIKE#${reportId}#${user.email}`, reportId, email: user.email },
                        ConditionExpression: "attribute_not_exists(id)"
                    }));
                } catch (putErr) {
                    if (putErr.name === "ConditionalCheckFailedException") {
                        return { statusCode: 400, headers, body: JSON.stringify({ error: "Ya has apoyado este reporte" }) };
                    }
                    throw putErr;
                }

                // 2. Si tuvo éxito, incrementamos
                const params = {
                    TableName: TABLE_NAME,
                    Key: { id: reportId },
                    UpdateExpression: "SET utility = if_not_exists(utility, :start) + :inc",
                    ExpressionAttributeValues: { ":inc": 1, ":start": 0 },
                    ReturnValues: "ALL_NEW"
                };
                const result = await docClient.send(new UpdateCommand(params));
                return { statusCode: 200, headers, body: JSON.stringify(result.Attributes) };
            } catch (err) {
                return { statusCode: 401, headers, body: JSON.stringify({ error: "Debe iniciar sesión para apoyar" }) };
            }
        }

        // --- RUTA protegida: GET /api/users/me ---
        if (method === "GET" && path === "/api/users/me") {
            try {
                const user = await verifyUserRole(token);
                const result = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
                const items = result.Items || [];

                const myReports = items.filter(r => !r.id.startsWith("ADMIN#") && !r.id.startsWith("LIKE#") && r.createdBy === user.email);
                const myLikes = items.filter(r => r.id.startsWith(`LIKE#`) && r.id.endsWith(`#${user.email}`)).map(r => r.reportId);

                return { statusCode: 200, headers, body: JSON.stringify({ myReports, myLikes }) };
            } catch (err) {
                return { statusCode: 401, headers, body: JSON.stringify({ error: "Sesión inválida" }) };
            }
        }

        return { statusCode: 404, headers, body: JSON.stringify({ error: "Ruta no encontrada" }) };

    } catch (error) {
        console.error("Error en el backend Lambda:", error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: "Error interno del servidor" }) };
    }
};