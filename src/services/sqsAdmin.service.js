import { 
  SQSClient, 
  CreateQueueCommand, 
  DeleteQueueCommand, 
  ListQueuesCommand 
} from "@aws-sdk/client-sqs";

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN 
  }
});

export const crearCola = async (nombreCola) => {
  if (!nombreCola || typeof nombreCola !== 'string' || nombreCola.trim().length < 3) {
    throw new Error('El nombre de la cola debe tener al menos 3 caracteres.');
  }

  const command = new CreateQueueCommand({ QueueName: nombreCola.trim() });
  const response = await sqsClient.send(command);
  return response.QueueUrl;
};

export const listarColas = async () => {
  const command = new ListQueuesCommand({});
  const response = await sqsClient.send(command);
  return response.QueueUrls || [];
};

export const eliminarCola = async (nombreCola) => {
  const colas = await listarColas();
  // Validación exacta del nombre al final de la URL
  const queueUrl = colas.find(url => url.split('/').pop() === nombreCola.trim());

  if (!queueUrl) {
    throw new Error(`La cola '${nombreCola}' no fue encontrada.`);
  }

  const command = new DeleteQueueCommand({ QueueUrl: queueUrl });
  await sqsClient.send(command);
  return true;
};