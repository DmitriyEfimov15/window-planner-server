import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegistrationI } from './types';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcryptjs';
import { MailService } from 'src/mail/mail.service';
import { Request, Response } from 'express';
import { TokensService } from 'src/tokens/tokens.service';
import { CreateRefreshTokenDto } from 'src/tokens/dto/createRefreshToken.dto';
import { Users } from 'src/user/user.model';
import { InjectModel } from '@nestjs/sequelize';
import { ResetPassword } from './reset-password.model';
import * as uuid from 'uuid';
import { Op } from 'sequelize';
import { VerifyEmailDto } from './dto/verifyEmail.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private mailService: MailService,
    private tokensService: TokensService,
    @InjectModel(ResetPassword)
    private resetPasswordRepository: typeof ResetPassword,
  ) {}

  private getDeviceInfo(req: Request) {
    const device = Array.isArray(req.headers['user-agent'])
      ? req.headers['user-agent'][0]
      : req.headers['user-agent'] || 'Неизвестное устройство';

    return device;
  }

  async getUserFromToken(authHeader: string): Promise<Users> {
    if (!authHeader) throw new UnauthorizedException('Нет токена');

    const bearer = authHeader.split(' ')[0];
    const token = authHeader.split(' ')[1];

    if (!token || !bearer) {
      throw new UnauthorizedException('Неверный формат токена!');
    }

    const userData = await this.tokensService.validateAccessToken(token);
    if (!userData) {
      throw new UnauthorizedException('Неверный или просроченный токен');
    }

    const user = await this.userService.findUserById(userData.id);
    if (!user) {
      throw new NotFoundException('Пользователь не найден!');
    }

    return user;
  }

  async registration(userData: RegistrationI) {
    const candidate = await this.userService.findUserByEmail(userData.email);

    if (candidate) {
      throw new HttpException(
        `Пользователь с данной почтой уже существует!`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const { password, email, name, surname } = userData;
    const hashPassword = await bcrypt.hash(password, 5);
    const user = await this.userService.createUser({
      password: hashPassword,
      email,
      name,
      surname,
    });

    if (user.activation_code) {
      await this.mailService.sendActivationCode(email, user.activation_code);
    }

    return {
      user: {
        activation_link: user.activation_link,
      },
      status: 0,
      message: 'Письмо с активацией отправлено на почту!',
    };
  }

  async verifyEmail(
    verifyEmailDto: VerifyEmailDto,
    req: Request,
    res: Response,
  ) {
    const { activationCode, activationLink } = verifyEmailDto;

    const user =
      await this.userService.findUserByActivationLink(activationLink);
    if (!user)
      throw new HttpException('Пользователь не найден!', HttpStatus.NOT_FOUND);

    if (user.activation_code !== activationCode) {
      throw new HttpException(
        'Неверный код активации!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const device_info = this.getDeviceInfo(req);

    const tokens = await this.tokensService.generateTokes(user);
    const tokensDto: CreateRefreshTokenDto = {
      device_info,
      user_id: user.id,
      token: tokens.refreshToken,
    };

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    await this.tokensService.createRefreshToken(tokensDto);

    user.is_email_verified = true;
    user.activation_code = null;
    user.activation_link = null;

    await user.save();

    return res.json({
      accessToken: tokens.accessToken,
      user: {
        email: user.email,
        name: user.name,
        surname: user.surname,
      },
    });
  }

  async login(email: string, password: string, req: Request, res: Response) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new HttpException(
        `Пользователь с почтой "${email}" не найден!`,
        HttpStatus.NOT_FOUND,
      );
    }

    const isPasswordEquals = await bcrypt.compare(password, user.password);
    if (!isPasswordEquals) {
      throw new HttpException('Пароли не совпадают!', HttpStatus.BAD_REQUEST);
    }

    const device_info = await this.getDeviceInfo(req);

    const tokens = await this.tokensService.generateTokes(user);
    const tokenDto = {
      token: tokens.refreshToken,
      device_info,
      user_id: user.id,
    };

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
    });

    await this.tokensService.createRefreshToken(tokenDto);

    return res.json({
      accessToken: tokens.accessToken,
      user: {
        email: user.email,
        name: user.name,
        surname: user.surname,
      },
    });
  }

  async logout(authHeader: string, req: Request, res: Response) {
    const user = await this.getUserFromToken(authHeader);
    if (!user) {
      throw new HttpException('Пользователь не найден!', HttpStatus.NOT_FOUND);
    }

    const device = await this.getDeviceInfo(req);

    const logOutResult = await this.tokensService.deleteRefreshToken(
      user.id,
      device,
    );

    res.clearCookie('refreshToken');

    return res.json(logOutResult);
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new HttpException('Token not found', HttpStatus.NOT_FOUND);
    }

    const tokenFromDb = await this.tokensService.findByToken(refreshToken);
    const userData =
      await this.tokensService.validateRefreshToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw new HttpException(
        'The user failed verification for refresh token',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userService.findUserById(userData.id);

    if (!user) {
      throw new NotFoundException(`Пользователь с id ${userData.id} не найден`);
    }

    const newTokens = await this.tokensService.generateTokes(user);
    const device = await this.getDeviceInfo(req);

    await this.tokensService.saveToken(user.id, device, newTokens.refreshToken);

    res.cookie('refreshToken', newTokens.refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
    });

    return res.json({
      accessToken: newTokens.accessToken,
      user: {
        email: user.email,
        name: user.name,
        surname: user.surname,
      },
      message: 'Токен обновлен',
      statusCode: 0,
    });
  }

  async requestToResetPassword(email: string) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException(
        `Пользователь с почтой "${email}" не найден!`,
      );
    }

    const token = uuid.v4();
    const hashToken = await bcrypt.hash(token, 5);

    await this.resetPasswordRepository.create({
      user_id: user.id,
      resetToken: hashToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    });

    const resetLink = `${process.env.CLIENT_URL}/auth/reset-password/${token}`;
    await this.mailService.sendResetPasswordLink(user.email, resetLink);

    return {
      message: 'Ссылка для сброса пароля отправлена',
      statusCode: 200,
    };
  }

  async resetPassword(newPassword: string, token: string) {
    const allEntries = await this.resetPasswordRepository.findAll({
      where: {
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!allEntries) {
      throw new NotFoundException('Токены не найдены');
    }

    let matchedEntry: any = null;

    for (const entry of allEntries) {
      const isMatch = await bcrypt.compare(token, entry.resetToken);
      if (isMatch) {
        matchedEntry = entry;
        break;
      }
    }

    if (!matchedEntry) {
      throw new BadRequestException('Недействительный или истёкший токен');
    }

    const user = await this.userService.findUserById(matchedEntry.user_id);
    if (!user) {
      throw new NotFoundException('Пользователь не найден!');
    }

    user.password = await bcrypt.hash(newPassword, 5);
    await user.save();

    await this.resetPasswordRepository.destroy({ where: { user_id: user.id } });

    await this.tokensService.deleteAllRefreshTokens(user.id);

    return {
      message: 'Пароль успешно изменен!',
      statusCode: 200,
    };
  }

  async deleteExpiredTokens() {
    const now = new Date();

    const deletedCount = await this.resetPasswordRepository.destroy({
      where: {
        expiresAt: {
          [Op.lt]: now,
        },
      },
    });

    return {
      deletedCount: deletedCount,
    };
  }

  async getProfile(authHeader: string) {
    const user = await this.getUserFromToken(authHeader);
    return {
      user: {
        email: user.email,
        name: user.name,
        surname: user.surname,
      },
    };
  }
}
