import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  private getBaseTemplate(title: string, content: string) {
    return `
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        background-color: #f5f7fa;
        color: #222;
        padding: 40px 0;
        display: flex;
        justify-content: center;
        width: 100%;
      ">
        <div style="
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          width: 100%;
          max-width: 520px;
          padding: 32px;
          box-sizing: border-box;
        ">
          <h1 style="
            font-size: 24px;
            color: #111827;
            text-align: center;
            margin-bottom: 16px;
          ">${title}</h1>

          <div style="
            font-size: 15px;
            line-height: 1.6;
            color: #374151;
            text-align: center;
          ">
            ${content}
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
          <p style="
            font-size: 13px;
            color: #6b7280;
            text-align: center;
          ">
            Наш сайт: <a href="${process.env.CLIENT_URL}" style="color:#45bfb0; text-decoration:none;">${process.env.CLIENT_URL}</a><br/>
            Если вы не запрашивали это письмо, просто проигнорируйте его.
          </p>
        </div>
      </div>
    `;
  }

  async sendActivationCode(email: string, code: string) {
    const content = `
      <p>Мы рады, что вы становитесь пользователем продуктов <b>Combica</b>!</p>
      <p style="margin-top: 16px;">Ваш код подтверждения:</p>
      <div style="
        font-size: 28px;
        font-weight: 700;
        color: #45bfb0;
        background: #f3f4f6;
        display: inline-block;
        padding: 12px 24px;
        border-radius: 8px;
        margin-top: 8px;
      ">${code}</div>
    `;
    await this.mailerService.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: `Ваш код активации`,
      html: this.getBaseTemplate('Добро пожаловать!', content),
    });
  }

  async sendResetPasswordLink(email: string, resetLink: string) {
    const content = `
      <p>Для смены пароля перейдите по ссылке:</p>
      <a href="${resetLink}" style="
        display: inline-block;
        background: #45bfb0;
        color: #ffffff;
        padding: 12px 24px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        margin-top: 12px;
      ">Сменить пароль</a>
    `;
    await this.mailerService.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Смена пароля',
      html: this.getBaseTemplate('Смена пароля', content),
    });
  }

  async sendChangeEmail(email: string, changeLink: string) {
    const content = `
      <p>Чтобы изменить адрес электронной почты, перейдите по ссылке:</p>
      <a href="${changeLink}" style="
        display: inline-block;
        background: #10b981;
        color: #ffffff;
        padding: 12px 24px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        margin-top: 12px;
      ">Сменить почту</a>
    `;
    await this.mailerService.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Смена почты',
      html: this.getBaseTemplate('Изменение почты', content),
    });
  }
}
