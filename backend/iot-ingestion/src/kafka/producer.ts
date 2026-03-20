import { Kafka, Producer } from 'kafkajs';
import { config } from '../config';
import winston from 'winston';

const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});

// Empleamos KafkaJS para enviar eventos desacoplados
const kafka = new Kafka({
  clientId: 'iot-ingestion-service',
  brokers: config.kafka.brokers,
});

const producer: Producer = kafka.producer();

export const connectKafkaProducer = async () => {
  try {
    await producer.connect();
    logger.info('Connected to Event Bus (Kafka) successfully.');
  } catch (error) {
    logger.error('Failed to connect to Event Bus (Kafka):', error);
    process.exit(1);
  }
};

export const publishToKafka = async (key: string, message: string) => {
  try {
    await producer.send({
      topic: config.kafka.topic,
      messages: [{ key, value: message }],
    });
    logger.debug(`Event published to Kafka: [Key: ${key}]`);
  } catch (error) {
    logger.error('Failed to publish event to Kafka:', error);
  }
};
