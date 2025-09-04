import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000); // ✅ await the promise
}
bootstrap().catch((err) => {
  console.error('Bootstrap failed', err);
  process.exit(1);
});
