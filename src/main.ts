/* eslint-disable */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
  .setTitle('Blog APIs')
  .setDescription('List APIs for simple Blog by Dat')
  .setVersion('1.0')
  .addTag('Auth')
  .addTag('User')
  .addBearerAuth()
  .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)
  app.enableCors()
  const expressApp = express();
  expressApp.use(express.static(join(__dirname, '../../uploads')));
  app.use(expressApp);
  await app.listen(3000);
}
bootstrap();
