import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Test } from '@nestjs/testing';
import type { Server } from 'http';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    server = app.getHttpServer() as unknown as Server; // ✅ type cast to Server
  });

  afterAll(async () => {
    await app.close();
  });

  it('/products (GET)', async () => {
    await request(server).get('/products').expect(200); // ✅ safe
  });
});
