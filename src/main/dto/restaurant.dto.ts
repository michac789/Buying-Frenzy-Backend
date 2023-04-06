import { IsString, IsNotEmpty } from 'class-validator';

export class RestaurantDto {
  @IsString()
  @IsNotEmpty()
  openingHours: string;

  @IsString()
  @IsNotEmpty()
  restaurantName: string;
}
