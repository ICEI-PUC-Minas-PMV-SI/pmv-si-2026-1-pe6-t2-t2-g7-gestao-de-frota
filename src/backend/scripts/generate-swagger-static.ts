import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { AppModule } from '../src/app.module';
import { AuthTypes } from '../src/modules/commons/auth/auth.types';
import { FirebaseService } from '../src/modules/commons/firebase/firebase.service';
import { typeORMConsts } from '../src/modules/commons/typeorm/consts';

const outputDir = join(process.cwd(), 'swagger-static');

const createSwaggerHtml = () => `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Backend Swagger</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
    />
    <style>
      body {
        margin: 0;
        background: #f5f7fb;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: './swagger.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis],
      });
    </script>
  </body>
</html>
`;

async function main() {
  const testingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(typeORMConsts.databaseProviders)
    .useValue({
      getRepository: () => ({}),
      query: async () => [],
      transaction: async (
        callback: (manager: {
          getRepository: () => {
            insert: () => Promise<void>;
          };
        }) => Promise<unknown>,
      ) =>
        callback({
          getRepository: () => ({
            insert: async () => undefined,
          }),
        }),
    })
    .overrideProvider(FirebaseService)
    .useValue({
      client: {
        auth: () => ({
          verifyIdToken: async () => ({
            uid: 'swagger-docs-user',
            email: 'swagger@example.com',
            firebase: {
              sign_in_provider: 'password',
            },
          }),
          deleteUser: async () => undefined,
        }),
      },
    })
    .compile();

  const app = testingModule.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );

  await app.init();

  const config = new DocumentBuilder()
    .setTitle(process.env.PROJECT_NAME ?? 'API')
    .setDescription('API Backend System')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      AuthTypes.ID_TOKEN,
    )
    .addSecurityRequirements(AuthTypes.ID_TOKEN)
    .build();

  const document = SwaggerModule.createDocument(app, config);

  await mkdir(outputDir, { recursive: true });
  await writeFile(
    join(outputDir, 'swagger.json'),
    `${JSON.stringify(document, null, 2)}\n`,
    'utf8',
  );
  await writeFile(join(outputDir, 'index.html'), createSwaggerHtml(), 'utf8');

  await app.close();
}

void main();
