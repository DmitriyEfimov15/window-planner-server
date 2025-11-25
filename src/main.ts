import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { Sequelize } from 'sequelize-typescript';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CLIENT_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
    credentials: true,  
  });
  app.use(cookieParser());
  const sequelize = app.get(Sequelize);
  await sequelize.sync({ alter: true }); 
  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
