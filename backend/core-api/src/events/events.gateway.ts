import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class EventsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    // Autenticación de WebSocket vía JWT en la conexión
    const token = client.handshake.auth?.token;
    if (!token) {
      console.log(`Connection rejected for client: ${client.id}`);
      client.disconnect();
      return;
    }
    // TODO: Verify token with JwtService
    console.log(`Client authenticated & connected: ${client.id}`);
  }

  @SubscribeMessage('live_telemetry_request')
  handleTelemetrySubscription(client: Socket, payload: any): void {
    // Alguien (ej. Dashboard) solicita updates en tiempo real
    client.join(`telemetry_${payload.deviceId}`);
    console.log(`Client ${client.id} listening to device ${payload.deviceId}`);
  }
  
  // Para ser llamado por el resto del backend (ej. consumidor Kafka)
  broadcastTelemetry(deviceId: string, data: any) {
    this.server.to(`telemetry_${deviceId}`).emit('telemetry_update', data);
  }
}
