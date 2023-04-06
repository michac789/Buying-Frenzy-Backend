import {
  Body,
  Controller,
  Post,
  Get,
  ParseIntPipe,
  Param,
  Put,
  Delete,
  BadRequestException,
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

  @Get()
  async listView(): Promise<Restaurant[]> {
    return await this.service.getAllRestaurants();
  }

  @Post()
  async createView(@Body() dto: RestaurantDto): Promise<Restaurant> {
    // TODO - maybe make this to a middleware, apply to all routes?
    try {
      return await this.service.createRestaurant(dto);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Get(':id')
  async detailView(
    @Param('id', ParseIntPipe) restaurantId: number,
  ): Promise<Restaurant> {
    return await this.service.getRestaurantById(restaurantId);
  }

  @Post(':id')
  async detailCreateView(
    @Param('id', ParseIntPipe) restaurantId: number,
    @Body() dto: MenuDto,
  ): Promise<MenuDto> {
    console.log(restaurantId);
    return await this.service.createMenuInRestaurant(restaurantId, dto);
  }

  @Put(':id')
  async updateView(
    @Param('id', ParseIntPipe) restaurantId: number,
    @Body() dto: RestaurantDto,
  ): Promise<Restaurant> {
    return await this.service.updateRestaurant(restaurantId, dto);
  }

  @Delete(':id')
  async deleteView(
    @Param('id', ParseIntPipe) restaurantId: number,
  ): Promise<Restaurant> {
    return await this.service.deleteRestaurant(restaurantId);
  }
}

@Controller('menu')
export class MenuController {
  constructor(private service: MenuService) {}

  @Get()
  async updateView(
    @Param('id', ParseIntPipe) menuId: number,
    @Body() dto: MenuDto,
  ): Promise<Menu> {
    return await this.service.updateMenu(menuId, dto);
  }

  @Delete(':id')
  async deleteView(@Param('id', ParseIntPipe) menuId: number): Promise<Menu> {
    return await this.service.deleteMenu(menuId);
  }
}
