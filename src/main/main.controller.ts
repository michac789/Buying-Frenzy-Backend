import { Body, Controller, Post, Get, ParseIntPipe, Param, Put, Delete, NotFoundException, BadRequestException } from "@nestjs/common";
import { Request, Req } from "@nestjs/common";
import { Restaurant } from "@prisma/client";
import { MainService, RestaurantService } from "./main.service";
import { RestaurantDto } from "./dto/restaurant.dto";


@Controller('main')
export class MainController {
  constructor (private mainService: MainService) {}

  @Get()
  test(@Req() req: Request) {
    console.log(req.body)
    return this.mainService.test()
  }
}

// TODO - add validators
// TODO - add permissions
// TODO - add error handler (404, 400, 409, etc.)
@Controller('restaurant')
export class RestaurantController {
  constructor (private service: RestaurantService) {}

  @Get()
  async listView(): Promise<Restaurant[]> {
    return await this.service.getAllRestaurants()
  }

  @Post()
  async createView(
    @Body() dto: RestaurantDto,
  ): Promise<Restaurant> {
    // TODO - maybe make this to a middleware, apply to all routes?
    try {
      return await this.service.createRestaurant(dto)
    } catch (error) {
      throw new BadRequestException(error)
    }
  }

  @Get(':id')
  async detailView(
    @Param('id', ParseIntPipe) restaurantId: number,
  ): Promise<Restaurant> {
    const instance = await this.service.getRestaurantById(restaurantId)
    if (instance === null) throw new NotFoundException()
    return instance
  }

  @Put(':id')
  async updateView(
    @Param('id', ParseIntPipe) restaurantId: number,
    @Body() dto: RestaurantDto,
  ): Promise<Restaurant> {
    return await this.service.updateRestaurant(restaurantId, dto)
  }

  @Delete(':id')
  async deleteView(
    @Param('id', ParseIntPipe) restaurantId: number,
  ): Promise<Restaurant> {
    return await this.service.deleteRestaurant(restaurantId)
  }
}
