import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SSOController } from './sso.controller.ts.js';
import { SSOService } from './sso.service.js';

@Module({
  imports: [JwtModule.register({})],
  controllers: [SSOController],
  providers: [SSOService],
})
export class SSOModule {}
