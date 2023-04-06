import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Restaurant } from '@prisma/client';

export class RestaurantDto {
  @IsString()
  @IsNotEmpty()
  openingHours: string;

  @IsString()
  @IsNotEmpty()
  restaurantName: string;
}

@ValidatorConstraint({ name: 'isDateFormat', async: false })
export class IsRequiredDateTimeFormat implements ValidatorConstraintInterface {
  validate(value: string) {
    const regex = /^\d{2}\/\d{2}\/\d{4}\/\d{2}:\d{2}$/;
    return regex.test(value);
  }

  defaultMessage() {
    return "Invalid date time format, please adhere to the format 'DD/MM/YYYY/HH:MM'";
  }
}

export class RestaurantQueryParams {
  @IsString()
  @Validate(IsRequiredDateTimeFormat)
  @IsOptional()
  datetime?: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  page?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  itemsperpage?: number;
}

export interface RestaurantPaginator {
  items: Restaurant[];
  pagination: {
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
