import { IsString, IsNotEmpty, Validate } from 'class-validator';

export class RestaurantDto {
  @IsString()
  @IsNotEmpty()
  openingHours: string;

  @IsString()
  @IsNotEmpty()
  restaurantName: string;
}
