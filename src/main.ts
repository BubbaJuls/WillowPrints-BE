import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Bootstrap: connects to Supabase PostgreSQL via DATABASE_URL (Prisma in AppModule).
 * No Docker; use .env with Supabase credentials for local and deployed runs.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation: class-validator DTOs (whitelist, transform)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS: allow WP-FE (Next.js) at localhost:3001
  app.enableCors({
    origin: 'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`WP-BE running on http://localhost:${port}`);
}
bootstrap();
