import { Module, MiddlewareConsumer, NestModule} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import { ProductModule } from './product/product.module';
import {LoggerMiddleware} from './common/logger.middleware';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: "postgres",
      password: "naveen357",
      database: "product_db2",
      autoLoadEntities: true,
      synchronize: true,
    }),
    ProductModule,
  ]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
