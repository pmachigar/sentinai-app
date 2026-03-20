import { Controller, Get, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('entities/users')
@UseGuards(RolesGuard)
export class UsersController {
  
  @Get()
  @Roles('SUPER_ADMIN')
  findAll() {
    return "This action returns all users (Restricted to SUPER_ADMIN)";
  }

  @Get('my-locations')
  @Roles('SUPER_ADMIN', 'HOME_OWNER')
  findMyLocations() {
    return "This action returns locations for given HOME_OWNER";
  }
}
