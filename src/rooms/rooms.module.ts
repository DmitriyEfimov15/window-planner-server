import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Rooms } from './rooms.model';
import { TokensModule } from 'src/tokens/tokens.module';
import { AuthModule } from 'src/auth/auth.module';
import { ObjectsModule } from 'src/objects/objects.module';

@Module({
  controllers: [RoomsController],
  providers: [RoomsService],
  imports: [
    SequelizeModule.forFeature([Rooms]),
    TokensModule,
    AuthModule,
    ObjectsModule,
  ],
  exports: [RoomsService]
})
export class RoomsModule {}
