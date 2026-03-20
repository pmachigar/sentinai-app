import * as mqtt from 'mqtt';
import { config } from '../config';
import { publishToKafka } from '../kafka/producer';
import { z } from 'zod';
import winston from 'winston';

const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});

// Zod Schema para validación estricta de telemetría IoT 
// (Implementando Strict Typing según reglas de arquitectura)
const telemetrySchema = z.object({
  deviceId: z.string(),
  temperature: z.number().optional(),
  humidity: z.number().optional(),
  timestamp: z.string().datetime(),
  status: z.enum(['active', 'idle', 'error']).optional(),
});

export const startMqttConsumer = () => {
  const client = mqtt.connect(config.mqtt.url);

  client.on('connect', () => {
    logger.info(`Connected to MQTT broker (EMQX) at ${config.mqtt.url}`);
    client.subscribe(config.mqtt.topic, (err) => {
      if (!err) {
        logger.info(`Subscribed to MQTT topic: ${config.mqtt.topic}`);
      } else {
        logger.error(`Failed to subscribe to MQTT topic:`, err);
      }
    });
  });

  client.on('message', async (topic, message) => {
    try {
      const parsedMessage = JSON.parse(message.toString());
      
      // Validación Estricta (Fail-Fast): filtramos la basura y evitamos
      // su propagación al resto de la arquitectura.
      const validatedPayload = telemetrySchema.parse(parsedMessage);
      
      logger.debug(`Received valid IoT payload from ${topic}`);
      
      // Emitimos al Event Bus Principal (Kafka) de forma asíncrona
      await publishToKafka(validatedPayload.deviceId, JSON.stringify(validatedPayload));
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn(`Invalid payload format received on ${topic}:`, error.errors);
      } else {
        logger.error(`Error processing MQTT message on ${topic}:`, error);
      }
    }
  });

  client.on('error', (err) => {
    logger.error('MQTT Client Error:', err);
  });
};
