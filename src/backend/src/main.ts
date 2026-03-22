import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AuthTypes } from './modules/commons/auth/auth.types';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.enableShutdownHooks();
  const expressServer = app.getHttpAdapter();
  expressServer.getInstance().set('trust proxy', true);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );
  app.enableCors({
    origin: '*',
    methods: ['DELETE', 'POST', 'PATCH', 'PUT', 'GET'],
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const title = `${process.env.PROJECT_NAME ?? 'API'}`;
    const config = new DocumentBuilder()
      .setTitle(title)
      .setDescription('API Backend System')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
        AuthTypes.ID_TOKEN,
      )
      .addSecurityRequirements(AuthTypes.ID_TOKEN)
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/docs', app, documentFactory);
  }
  await app.listen(process.env.PORT ?? 3030);
}
void bootstrap();
