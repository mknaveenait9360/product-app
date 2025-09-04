import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductModule } from './product/product.module';
import { LoggerMiddleware } from './common/logger.middleware';
import { DB_CONFIG } from './common/contants';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>(DB_CONFIG.HOST) || 'localhost',
        port: parseInt(configService.get<string>(DB_CONFIG.PORT) || '5432', 10),
        username: configService.get<string>(DB_CONFIG.USERNAME) || 'postgres',
        password: configService.get<string>(DB_CONFIG.PASSWORD) || 'naveen357',
        database: configService.get<string>(DB_CONFIG.NAME) || 'product_db2',
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    ProductModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
