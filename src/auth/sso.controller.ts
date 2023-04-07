import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { SSOService } from './sso.service';
import {
  UserDto,
  UserPasswordDto,
  UserBalanceDto,
  UserSafeType,
} from './dto/user.dto';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from './sso.utils';
import { GetUser } from './sso.utils';
import { User } from '@prisma/client';

@Controller('sso')
export class SSOController {
  constructor(private ssoService: SSOService) {}

  /*
   * [POST] /sso/register/
   * Register (create) new user, need unique name and password.
   * Return 201 if success, with the signed access token.
   * Return 400 if it does not satisfy dto constraint.
   * Return 409 if conflict (no duplicate name allowed).
   */
  @Post('register')
  register(@Body() dto: UserDto): Promise<{ accessToken: string }> {
    return this.ssoService.register(dto);
  }

  /*
   * [POST] /sso/login/
   * Login with name and password.
   * Return 200 if success, with the signed access token.
   * Return 400 if it does not satisfy dto constraint.
   * Return 401 unauthorized if name or password is wrong.
   */
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: UserDto): Promise<{ accessToken: string }> {
    return this.ssoService.login(dto);
  }

  /**
   * [GET] /sso/user/
   * Get profile info (id, name, email, cashBalance) of the requesting user.
   * Return 200 if success, with profile information.
   * Return 401 if not logged in.
   */
  @Get('user')
  @UseGuards(JwtGuard)
  async getProfile(@GetUser() user: User): Promise<UserSafeType> {
    return user;
  }

  /**
   * [PUT] /sso/user/
   * Allows you to change your password and email, given old password.
   * Return 200 if success.
   * Return 400 if it does not satisfy dto constraint.
   * Return 401 if not logged in, or if password does not match.
   */
  @Put('user')
  @UseGuards(JwtGuard)
  changeUserData(@Body() dto: UserPasswordDto): Promise<UserSafeType> {
    return this.ssoService.changePassword(dto);
  }

  /**
   * [DELETE] /sso/user/
   * Given user name and correct password, delete the account.
   * Return 204 if success.
   * Return 400 if it does not satisfy dto constraint.
   * Return 401 if not logged in, or if password does not match.
   */
  @Delete('user')
  @UseGuards(JwtGuard)
  @HttpCode(204)
  deleteUser(@Body() dto: UserDto): Promise<UserSafeType> {
    return this.ssoService.deleteAccount(dto);
  }

  /**
   * [POST] /sso/user/topup/
   * Topup (increase) the cash balance of a user.
   * Note: realistically, you should integrate this with 3rd party API to make payment
   * For the sake of this sample, it is assumed you already make the necessary payment
   * Increase current user cashBalance by 'additionalCashBalance'
   * Return 200 if topup success, update appropriate balance in database.
   * Return 400 if body does not satisfy dto constraint.
   * Return 401 if not logged in.
   */
  @Post('user/topup')
  @UseGuards(JwtGuard)
  @HttpCode(200)
  topUp(
    @Body() dto: UserBalanceDto,
    @GetUser() user: User,
  ): Promise<UserSafeType> {
    return this.ssoService.topUp(dto, user);
  }
}
