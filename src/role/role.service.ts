import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from './role.model';

@Injectable()
export class RoleService implements OnModuleInit {
  constructor(@InjectModel(Role) private roleRepository: typeof Role) {}

  async createRole(value: string) {
    const role = await this.roleRepository.create({ value });
    return role;
  }

  async getRoleByName(value: string) {
    const role = await this.roleRepository.findOne({ where: { value } });
    return role;
  }

  async onModuleInit() {
    const userRole = await this.getRoleByName('USER');
    if (!userRole) {
      await this.createRole('USER');
      console.log('Роль USER создана автоматически');
    }
  }
}
