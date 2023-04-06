import { Module } from '@nestjs/common';
import {
  MenuController,
  RestaurantController,
  PurchaseController,
} from './main.controller';
import {
  MenuService,
  RestaurantService,
  PurchaseService,
} from './main.service';

@Module({
  imports: [],
  controllers: [RestaurantController, MenuController, PurchaseController],
  providers: [RestaurantService, MenuService, PurchaseService],
})
export class MainModule {}
