import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Users } from './user.model';
import { Role } from 'src/role/role.model';
import { RoleModule } from 'src/role/role.module';

@Module({
  providers: [UserService],
  exports: [UserService],
  imports: [SequelizeModule.forFeature([Users, Role]), RoleModule],
})
export class UserModule {}
