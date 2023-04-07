import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SSOController } from './sso.controller';
import { SSOService } from './sso.service';
import { JwtStrategy } from './sso.utils';

@Module({
  imports: [JwtModule.register({})],
  controllers: [SSOController],
  providers: [SSOService, JwtStrategy],
})
export class SSOModule {}
