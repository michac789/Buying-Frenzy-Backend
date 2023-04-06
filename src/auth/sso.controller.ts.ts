import { Controller, Post, Body } from '@nestjs/common';
import { SSOService } from './sso.service';
import { UserDto } from './dto/user.dto';

@Controller('sso')
export class SSOController {
  constructor(private authService: SSOService) {}

  /*
   * [POST] /sso/register/
   * Register (create) new user, need unique name and password.
   * Return 201 if success, with the signed access token.
   * Return 400 if it does not satisfy dto constraint.
   * Return 409 if conflict (no duplicate name allowed).
   */
  @Post('register')
  register(@Body() dto: UserDto): Promise<{ access_token: string }> {
    return this.authService.register(dto);
  }

  /*
   * [POST] /sso/login/
   * Login with name and password.
   * Return 200 if success, with the signed access token.
   * Return 401 unauthorized if name or password is wrong.
   */
  @Post('login')
  login(@Body() dto: UserDto): Promise<{ access_token: string }> {
    return this.authService.login(dto);
  }
}
