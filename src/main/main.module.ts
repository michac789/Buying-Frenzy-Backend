import { Module } from "@nestjs/common";
import { MainController, RestaurantController } from "./main.controller";
import { MainService, RestaurantService } from "./main.service";


@Module({
  imports: [],
  controllers: [MainController, RestaurantController],
  providers: [MainService, RestaurantService],
})
export class MainModule{}
