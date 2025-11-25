import { Module } from '@nestjs/common';
import { PlanController } from './plan.controller';
import { PlanService } from './plan.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Plans } from './plan.model';
import { TokensModule } from 'src/tokens/tokens.module';
import { AuthModule } from 'src/auth/auth.module';
import { RoomsModule } from 'src/rooms/rooms.module';
import { ObjectsModule } from 'src/objects/objects.module';

@Module({
  controllers: [PlanController],
  providers: [PlanService],
  imports: [
    SequelizeModule.forFeature([Plans]),
    TokensModule,
    AuthModule,
    RoomsModule,
    ObjectsModule,
  ],
  exports: [PlanService]
})
export class PlanModule {}
