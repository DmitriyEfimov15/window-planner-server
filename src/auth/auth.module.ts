import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { MailModule } from 'src/mail/mail.module';
import { Role } from 'src/role/role.model';
import { JwtModule } from '@nestjs/jwt';
import { TokensModule } from 'src/tokens/tokens.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ResetPassword } from './reset-password.model';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [
    UserModule,
    MailModule,
    Role,
    JwtModule.register({
      global: true,
    }),
    TokensModule,
    SequelizeModule.forFeature([ResetPassword])
  ],
  exports: [AuthService]
})
export class AuthModule {}
