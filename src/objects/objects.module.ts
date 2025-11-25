import { Module } from '@nestjs/common';
import { ObjectsService } from './objects.service';
import { ObjectsController } from './objects.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Objects } from './objects.model';
import { AuthModule } from 'src/auth/auth.module';
import { TokensModule } from 'src/tokens/tokens.module';

@Module({
  providers: [ObjectsService],
  controllers: [ObjectsController],
  imports: [SequelizeModule.forFeature([Objects]), AuthModule, TokensModule],
  exports: [ObjectsService]
})
export class ObjectsModule {}
