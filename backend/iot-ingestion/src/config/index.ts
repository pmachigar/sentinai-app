import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Tipado Estricto de Entorno implementando Zod de acuerdo a las Reglas de Arquitectura
const envSchema = z.object({
  MQTT_BROKER_URL: z.string().default('mqtt://localhost:1883'),
  MQTT_TOPIC: z.string().default('sensor/+/telemetry'),
  KAFKA_BROKERS: z.string().default('localhost:9092'),
  KAFKA_TOPIC: z.string().default('iot_telemetry'),
  LOG_LEVEL: z.string().default('info'),
});

const _env = envSchema.parse(process.env);

export const config = {
  mqtt: {
    url: _env.MQTT_BROKER_URL,
    topic: _env.MQTT_TOPIC,
  },
  kafka: {
    // Si pasamos múltiples brokers, permitimos separarlos por coma.
    brokers: _env.KAFKA_BROKERS.split(','),
    topic: _env.KAFKA_TOPIC,
  },
  logLevel: _env.LOG_LEVEL,
};
