import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ModelModule } from './model/model.module';
import { MainModule } from './main/main.module';
import { SSOModule } from './auth/sso.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ModelModule,
    MainModule,
    SSOModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
