import {
  ConflictException,
  UnauthorizedException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import {
  UserBalanceDto,
  UserDto,
  UserPasswordDto,
  UserSafeType,
} from './dto/user.dto';
import { ModelService } from '../model/model.service';
import { User } from '@prisma/client';

@Injectable()
export class SSOService {
  constructor(private model: ModelService, private jwt: JwtService) {}

  async register(dto: UserDto): Promise<{ access_token: string }> {
    try {
      const user = await this.model.user.create({
        data: {
          cashBalance: 0,
          name: dto.name,
          password: await argon.hash(dto.password),
          email: dto.email,
        },
      });
      return this.signToken(user.id, user.name);
    } catch (error) {
      if (error.code === 'P2002')
        throw new ConflictException('This username is already taken!'); // same username used
      throw new BadRequestException(error); // just in case
    }
  }

  async login(dto: UserDto): Promise<{ access_token: string }> {
    const user = await this.model.user.findUnique({
      where: {
        name: dto.name,
      },
    });
    // for security reason, throw same 401 error if invalid name or password
    if (!user) throw new UnauthorizedException('Credentials incorrect');
    const verified = await argon.verify(user.password, dto.password);
    if (!verified) throw new UnauthorizedException('Credentials incorrect');
    return this.signToken(user.id, user.name);
  }

  async changePassword(dto: UserPasswordDto): Promise<UserSafeType> {
    const user = await this.model.user.findUnique({
      where: {
        name: dto.name,
      },
    });
    const verified = await argon.verify(user.password, dto.password);
    if (!verified) throw new UnauthorizedException('Wrong Password!');
    const instance = await this.model.user.update({
      where: { name: dto.name },
      data: {
        password: await argon.hash(dto.newPassword),
        email: dto.email,
      },
    });
    const { id, cashBalance, name, email } = instance;
    return { id, cashBalance, name, email };
  }

  async deleteAccount(dto: UserDto): Promise<UserSafeType> {
    const user = await this.model.user.findUnique({
      where: {
        name: dto.name,
      },
    });
    const verified = await argon.verify(user.password, dto.password);
    if (!verified) throw new UnauthorizedException('Wrong Password!');
    const instance = await this.model.user.delete({
      where: { name: dto.name },
    });
    const { id, cashBalance, name, email } = instance;
    return { id, cashBalance, name, email };
  }

  async topUp(dto: UserBalanceDto, user: User): Promise<UserSafeType> {
    const instance = await this.model.user.update({
      where: { name: user.name },
      data: {
        cashBalance: user.cashBalance.toNumber() + dto.additionalCashBalance,
      },
    });
    const { id, cashBalance, name, email } = instance;
    return { id, cashBalance, name, email };
  }

  async signToken(
    userId: number,
    name: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      name,
    };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '60m', // have to login again to get new token after 60 minutes
      secret: '123456', // use more complex string and env variable in real production!
    });
    return { access_token: token };
  }
}
