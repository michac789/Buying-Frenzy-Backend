import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SSOController } from './sso.controller.ts.js';
import { SSOService } from './sso.service.js';
import { JwtStrategy } from './sso.utils.js';

@Module({
  imports: [JwtModule.register({})],
  controllers: [SSOController],
  providers: [SSOService, JwtStrategy],
})
export class SSOModule {}
