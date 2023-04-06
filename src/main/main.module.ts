import { Module } from '@nestjs/common';
import {
  MainController,
  MenuController,
  RestaurantController,
} from './main.controller';
import { MainService, MenuService, RestaurantService } from './main.service';

@Module({
  imports: [],
  controllers: [MainController, RestaurantController, MenuController],
  providers: [MainService, RestaurantService, MenuService],
})
export class MainModule {}
