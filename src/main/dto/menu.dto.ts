import { Decimal } from '@prisma/client/runtime';
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class MenuDto {
  @IsString()
  @IsNotEmpty()
  dishName: string;

  @IsNumber()
  @Min(0)
  price: Decimal;
}
