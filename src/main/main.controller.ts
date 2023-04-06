import {
  Body,
  Controller,
  Post,
  Get,
  ParseIntPipe,
  Param,
  Put,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { Request, Req } from '@nestjs/common';
import { Restaurant, Menu } from '@prisma/client';
import { MainService, RestaurantService, MenuService } from './main.service';
import { RestaurantDto } from './dto/restaurant.dto';
import { MenuDto } from './dto/menu.dto';

@Controller('main')
export class MainController {
  constructor(private mainService: MainService) {}

  @Get()
  test(@Req() req: Request) {
    console.log(req.body);
    return this.mainService.test();
  }
}

// TODO - add validators
// TODO - add permissions
// TODO - add error handler (404, 400, 409, etc.)
@Controller('restaurant')
export class RestaurantController {
  constructor(private service: RestaurantService) {}

  // [GET] /restaurant/
  @Get()
  async listView(): Promise<Restaurant[]> {
    return await this.service.getAllRestaurants();
  }

  /**
   * [POST] /restaurant/
   * Create a new restaurant instance, cashBalance defaulted to 0.
   * Return 201 if success, with the new created instance.
   * Return 400 if it does not satisfy dto constraint.
   * Return 409 if conflict (same restaurantName).
   */
  @Post()
  async createView(@Body() dto: RestaurantDto): Promise<Restaurant> {
    return await this.service.createRestaurant(dto);
  }

  /**
   * [GET] /restaurant/:id/
   * Get a restaurant instance (including all menu), given its id.
   * Return 200 if success, with the restaurant instance and all menu in that restaurant.
   * Return 404 if instance not found (invalid id).
   */
  @Get(':id')
  async detailView(
    @Param('id', ParseIntPipe) restaurantId: number,
  ): Promise<Restaurant> {
    return await this.service.getRestaurantById(restaurantId);
  }

  /**
   * [POST] /restaurant/:id/
   * Create a menu with a foreign key to a restaurant instance.
   * Return 201 if success, with the new created instance.
   * Return 400 if it does not satisfy dto constraint.
   * Return 404 if instance not found (invalid id).
   * TODO - do not allow dish name to be the same in the same resto?
   */
  @Post(':id')
  async detailCreateView(
    @Param('id', ParseIntPipe) restaurantId: number,
    @Body() dto: MenuDto,
  ): Promise<MenuDto> {
    return await this.service.createMenuInRestaurant(restaurantId, dto);
  }

  /**
   * [PUT] /restaurant/:id/
   * Update existing restaurant instance, given its id.
   * Return 200 if success, with the new updated instance.
   * Return 400 if it does not satisfy dto constraint.
   * Return 404 if instance not found (invalid id).
   */
  @Put(':id')
  async updateView(
    @Param('id', ParseIntPipe) restaurantId: number,
    @Body() dto: RestaurantDto,
  ): Promise<Restaurant> {
    return await this.service.updateRestaurantById(restaurantId, dto);
  }

  /**
   * [DELETE] /restaurant/:id/
   * Delete existing restaurant instance, given its id.
   * Return 204 if success.
   * Return 404 if instance not found (invalid id).
   * TODO - set oncascade delete on schema? what happen when the fk is deleted?
   */
  @Delete(':id')
  @HttpCode(204)
  async deleteView(@Param('id', ParseIntPipe) restaurantId: number) {
    return await this.service.deleteRestaurantById(restaurantId);
  }
}

@Controller('menu')
export class MenuController {
  constructor(private service: MenuService) {}

  /**
   * [PUT] /restaurant/:id/
   * Update existing menu instance, given its id.
   * Return 200 if success, with the new updated instance.
   * Return 400 if it does not satisfy dto constraint.
   * Return 404 if instance not found (invalid id).
   */
  @Put()
  async updateView(
    @Param('id', ParseIntPipe) menuId: number,
    @Body() dto: MenuDto,
  ): Promise<Menu> {
    return await this.service.updateMenuById(menuId, dto);
  }

  /**
   * [DELETE] /menu/:id/
   * Delete existing menu instance, given its id.
   * Return 204 if success, with the new created instance.
   * Return 404 if instance not found (invalid id).
   */
  @Delete(':id')
  @HttpCode(204)
  async deleteView(@Param('id', ParseIntPipe) menuId: number): Promise<Menu> {
    return await this.service.deleteMenuById(menuId);
  }
}
