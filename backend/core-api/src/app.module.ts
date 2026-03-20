import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AuthService } from './auth/auth.service';
import { BillingController } from './billing/billing.controller';
import { UsersController } from './entities/users.controller';
import { EventsGateway } from './events/events.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super_secret',
      signOptions: { expiresIn: '60m' },
    }),
  ],
  controllers: [BillingController, UsersController],
  providers: [PrismaService, AuthService, EventsGateway],
})
export class AppModule {}
