import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

// Inicializamos DynamoDB. En AWS Lambda, esto detecta automáticamente tu Rol IAM.
const client = new DynamoDBClient({}); 
const docClient = DynamoDBDocumentClient.from(client);

// Tomamos el nombre de la tabla desde las variables de entorno de Terraform
const TABLE_NAME = process.env.DYNAMO_TABLE_NAME || "hito1-fdici12-app-data";

export const handler = async (event) => {
    // 1. Configuración de CORS obligatoria para API Gateway
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Para que tu Frontend en CloudFront no sea bloqueado
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
        "Access-Control-Allow-Headers": "Content-Type,Authorization"
    };

    try {
        // 2. API Gateway HTTP API inyecta el método y la ruta aquí:
        const method = event.requestContext?.http?.method || event.httpMethod;
        const path = event.rawPath || event.path;

        console.log(`[LOG] Recibida petición: ${method} ${path}`);

        // Manejo de Preflight (Peticiones automáticas del navegador para CORS)
        if (method === "OPTIONS") {
            return { statusCode: 200, headers, body: JSON.stringify({ message: "CORS OK" }) };
        }

        // --- RUTA: GET /health ---
        if (method === "GET" && path === "/health") {
            return { statusCode: 200, headers, body: JSON.stringify({ status: "ok" }) };
        }

        // --- RUTA: GET /api/reports ---
        if (method === "GET" && path === "/api/reports") {
            const queryParams = event.queryStringParameters || {};
            const subSector = queryParams.subSector;
            const sort = queryParams.sort || 'utility';

            const result = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
            let reports = result.Items || [];

            // Filtrar
            if (subSector) {
                reports = reports.filter(r => r.subSector === subSector);
            }

            // Ordenar
            reports.sort((a, b) => {
                if (sort === 'importance') return b.importance - a.importance;
                if (sort === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                return (b.utility || 0) - (a.utility || 0);
            });

            return { statusCode: 200, headers, body: JSON.stringify(reports) };
        }

        // --- RUTA: POST /api/reports ---
        if (method === "POST" && path === "/api/reports") {
            const body = JSON.parse(event.body || "{}");
            const { subSector, title, description, importance } = body;

            const newReport = {
                id: uuidv4(),
                subSector,
                title,
                description,
                importance: parseInt(importance, 10),
                createdAt: new Date().toISOString(),
                utility: 0 // Likes iniciales
            };

            await docClient.send(new PutCommand({
                TableName: TABLE_NAME,
                Item: newReport
            }));

            return { statusCode: 201, headers, body: JSON.stringify(newReport) };
        }

        // --- RUTA: POST /api/reports/:id/like ---
        const likeMatch = path.match(/^\/api\/reports\/([^\/]+)\/like$/);
        if (method === "POST" && likeMatch) {
            const reportId = likeMatch[1]; 

            const params = {
                TableName: TABLE_NAME,
                Key: { id: reportId },
                UpdateExpression: "SET utility = if_not_exists(utility, :start) + :inc",
                ExpressionAttributeValues: {
                    ":inc": 1,
                    ":start": 0
                },
                ReturnValues: "ALL_NEW"
            };

            const result = await docClient.send(new UpdateCommand(params));
            return { statusCode: 200, headers, body: JSON.stringify(result.Attributes) };
        }

        // Si la ruta no existe
        return { 
            statusCode: 404, 
            headers, 
            body: JSON.stringify({ error: "Ruta no encontrada" }) 
        };

    } catch (error) {
        console.error("Error en el backend Lambda:", error);
        return { 
            statusCode: 500, 
            headers, 
            body: JSON.stringify({ error: "Error interno del servidor" }) 
        };
    }
};