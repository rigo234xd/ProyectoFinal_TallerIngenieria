import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMO_TABLE_NAME || "hito1-fdici12-olea-app-data";

async function deleteAll() {
  console.log("Scanning table:", TABLE_NAME);
  try {
    const data = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
    const items = data.Items || [];
    console.log(`Found ${items.length} items to delete.`);
    
    for (const item of items) {
      console.log(`Deleting item: ${item.id}`);
      await docClient.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id: item.id }
      }));
    }
    console.log("All items deleted successfully.");
  } catch (error) {
    console.error("Error deleting items:", error);
  }
}

deleteAll();
