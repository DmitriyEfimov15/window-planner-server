import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistrationDto } from './dto/registration.dto';
import { VerifyEmailDto } from './dto/verifyEmail.dto';
import { Request, Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { SendRequestToResetPasswordDto } from './dto/sendRequestToResetPasswordDto.dto';
import { ResetPasswordDto } from './dto/resetPasswordDto.dto';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/registration')
  registration(@Body() registrationDto: RegistrationDto) {
    return this.authService.registration(registrationDto);
  }

  @Post('/verify-email')
  verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.authService.verifyEmail(verifyEmailDto, req, res);
  }

  @Post('/login')
  login(@Body() loginDto: LoginDto, @Req() req: Request, @Res() res: Response) {
    return this.authService.login(loginDto.email, loginDto.password, req, res);
  }

  @Get('/logout')
  logout(
    @Headers('authorization') authHeader: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.authService.logout(authHeader, req, res);
  }

  @Get('/refresh')
  refresh(@Req() req: Request, @Res() res: Response) {
    return this.authService.refresh(req, res);
  }

  @Post('/send-request-to-reset-password')
  sendRequestToChangePsasword(
    @Body() sendRequestToResetPasswordDto: SendRequestToResetPasswordDto,
  ) {
    return this.authService.requestToResetPassword(
      sendRequestToResetPasswordDto.email,
    );
  }

  @Post('/reset-password/:token')
  resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Param('token') token: string,
  ) {
    return this.authService.resetPassword(resetPasswordDto.newPassword, token);
  }

  @Get('/get-profile')
  @UseGuards(JwtAuthGuard)
  getProfile(
    @Headers('authorization') authHeader: string,
  ) {
    return this.authService.getProfile(authHeader)
  }
}
