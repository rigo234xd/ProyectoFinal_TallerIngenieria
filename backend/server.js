import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { ScanCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000; 

app.get('/api/reports', async (req, res) => {
    try {
        const { subSector } = req.query;
        
        let params = {
            TableName: TABLE_NAME,
        };

        const result = await docClient.send(new ScanCommand(params));
        
        let reports = result.Items || [];

        if (subSector) {
            reports = reports.filter(r => r.subSector === subSector);
        }

        const sort = req.query.sort || 'utility'; // 'utility', 'importance', 'date'
        
        reports.sort((a, b) => {
            if (sort === 'importance') return b.importance - a.importance;
            if (sort === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
            // Default: utility
            return (b.utility || 0) - (a.utility || 0);
        });

        res.json(reports);
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ error: "No se pudieron obtener los reportes" });
    }
});

// Crear un reporte
app.post('/api/reports', async (req, res) => {
    try {
        const { subSector, title, description, importance } = req.body;
        
        if (!subSector || !title || !description || !importance) {
            return res.status(400).json({ error: "Faltan datos obligatorios" });
        }

        const newReport = {
            id: uuidv4(),
            subSector,
            title,
            description,
            importance: parseInt(importance, 10),
            createdAt: new Date().toISOString(),
            utility: 0 // Likes iniciales
        };

        const params = {
            TableName: TABLE_NAME,
            Item: newReport
        };

        await docClient.send(new PutCommand(params));
        res.status(201).json(newReport);
    } catch (error) {
        console.error("Error creating report:", error);
        res.status(500).json({ error: "Error al crear el reporte" });
    }
});

// Dar 'Like' (Utilidad) a un reporte
app.post('/api/reports/:id/like', async (req, res) => {
    try {
        const { id } = req.params;

        const params = {
            TableName: TABLE_NAME,
            Key: { id },
            UpdateExpression: "SET utility = if_not_exists(utility, :start) + :inc",
            ExpressionAttributeValues: {
                ":inc": 1,
                ":start": 0
            },
            ReturnValues: "ALL_NEW"
        };

        const result = await docClient.send(new UpdateCommand(params));
        res.json(result.Attributes);
    } catch (error) {
        console.error("Error updating utility:", error);
        res.status(500).json({ error: "Error al actualizar utilidad" });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
