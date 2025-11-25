import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { Users } from './user/user.model';
import { MailModule } from './mail/mail.module';
import { TokensModule } from './tokens/tokens.module';
import { RoleModule } from './role/role.module';
import { Role } from './role/role.model';
import { RefreshTokes } from './tokens/refreshTokens.model';
import { ResetPassword } from './auth/reset-password.model';
import { ObjectsModule } from './objects/objects.module';
import { Objects } from './objects/objects.model';
import { RoomsModule } from './rooms/rooms.module';
import { Rooms } from './rooms/rooms.model';
import { PlanModule } from './plan/plan.module';
import { Plans } from './plan/plan.model';
import { ConvaItemsModule } from './conva-items/conva-items.module';
import { ConvaItem } from './conva-items/conva-items.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.local`,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [Users, Role, RefreshTokes, ResetPassword, Objects, Rooms, Plans, ConvaItem],
      autoLoadModels: true,
    }),
    UserModule,
    AuthModule,
    MailModule,
    TokensModule,
    RoleModule,
    ObjectsModule,
    RoomsModule,
    PlanModule,
    ConvaItemsModule,
  ],
})
export class AppModule {}
