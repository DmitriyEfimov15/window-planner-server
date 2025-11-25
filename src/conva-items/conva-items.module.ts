import { Module } from '@nestjs/common';
import { ConvaItemsService } from './conva-items.service';
import { ConvaItemsController } from './conva-items.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConvaItem } from './conva-items.model';
import { PlanModule } from 'src/plan/plan.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [ConvaItemsService],
  controllers: [ConvaItemsController],
  imports: [
    SequelizeModule.forFeature([ConvaItem]),
    PlanModule,
    TokensModule,
    AuthModule,
  ]
})
export class ConvaItemsModule {}
