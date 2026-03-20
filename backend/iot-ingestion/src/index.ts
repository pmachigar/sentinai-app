import { connectKafkaProducer } from './kafka/producer';
import { startMqttConsumer } from './mqtt/consumer';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});

const bootstrap = async () => {
  logger.info('Starting IoT Ingestion Service...');
  
  // 1. Conectar Productor a Event Bus (Kafka)
  await connectKafkaProducer();
  
  // 2. Iniciar Consumidor MQTT (EMQX)
  startMqttConsumer();
  
  // Manejo de graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Shutting down gracefully...');
    process.exit(0);
  });
};

bootstrap();
