import { Decimal } from '@prisma/client/runtime';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}

// used to change password
export class UserPasswordDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @IsEmail()
  @IsOptional()
  email: string;
}

// top up functionality
export class UserBalanceDto {
  @IsNumber()
  @Min(0)
  additionalCashBalance: number;
}

// define safe return type of user instance (exclude password)
export interface UserSafeType {
  id: number;
  name: string;
  email: string;
  cashBalance: Decimal;
}
