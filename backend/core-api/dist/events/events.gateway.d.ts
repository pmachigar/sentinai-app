import { OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class EventsGateway implements OnGatewayConnection {
    server: Server;
    handleConnection(client: Socket): void;
    handleTelemetrySubscription(client: Socket, payload: any): void;
    broadcastTelemetry(deviceId: string, data: any): void;
}
