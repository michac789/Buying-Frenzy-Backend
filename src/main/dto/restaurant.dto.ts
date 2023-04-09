import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Decimal } from '@prisma/client/runtime';
import { Restaurant, Menu } from '@prisma/client';

@ValidatorConstraint({ name: 'isRequiredOpeningHoursFormat', async: false })
export class IsRequiredOpeningHoursFormat
  implements ValidatorConstraintInterface
{
  validate(value: string) {
    try {
      const timeArr: string[] = value.split('/');
      // the length should be 14, the delimiter '/' should split into 14 different time
      if (timeArr.length !== 14) return false;
      for (let i = 0; i < timeArr.length; i++) {
        let time = timeArr[i];
        if (!time.includes(':')) return false;
        let [hour, min]: string[] = time.split(':');
        // hour can only be from 00 to 23 inclusive
        if (parseInt(hour) < 0 || parseInt(hour) > 23) return false;
        // minute can only be from 00 to 59 inclusive
        if (parseInt(min) < 0 || parseInt(min) > 59) return false;
      }
      return true;
    } catch (error) {
      // just in  case: for example if value is undefined, there will be an error
      // rather than causing 500, anything that causes error above with automatically return false
      return false;
    }
  }

  defaultMessage(): string {
    return "Invalid format, should be a string consisting of 14 time (format HH:MM), with '/' as the delimiter";
  }
}

export class RestaurantDto {
  @IsString()
  @IsNotEmpty()
  @Validate(IsRequiredOpeningHoursFormat)
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

export class PaginatorQueryParams {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  page?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  itemsperpage?: number;
}

export class RestaurantQueryParams extends PaginatorQueryParams {
  @IsString()
  @Validate(IsRequiredDateTimeFormat)
  @IsOptional()
  datetime?: string;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  sort?: boolean; // default false, if true sort alphabetically

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  pricelte?: number; // 'price less than or equal to' filter

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  pricegte?: number; // 'price greater than or equal to' filter

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  dishlte?: number; // 'dish count less than or equal to' filter

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  dishgte?: number; // 'dish count grater than or equal to' filter
}

export class RestaurantSearchQueryParams extends PaginatorQueryParams {
  @IsString()
  @IsNotEmpty()
  q: string;
}

export interface RestaurantWithMenu {
  id: number;
  cashBalance: Decimal;
  openingHours: string;
  restaurantName: string;
  ownerId: number | null;
  menus: Menu[];
}

export interface RestaurantPaginator {
  items: Restaurant[];
  pagination: {
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface RestaurantWithRelevance extends Restaurant {
  relevance: number;
}

export interface RestaurantSearchPaginator extends RestaurantPaginator {
  items: RestaurantWithRelevance[];
}
