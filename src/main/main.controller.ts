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
  UseGuards,
  Query,
} from '@nestjs/common';
import { Restaurant, Menu, PurchaseHistory } from '@prisma/client';
import {
  RestaurantService,
  MenuService,
  PurchaseService,
} from './main.service';
import { JwtGuard, GetUser } from '../auth/sso.utils';
import { User } from '@prisma/client';
import {
  RestaurantDto,
  RestaurantQueryParams,
  RestaurantPaginator,
  RestaurantSearchQueryParams,
  RestaurantSearchPaginator,
} from './dto/restaurant.dto';
import { MenuDto } from './dto/menu.dto';
import { PurchaseDto, PurchaseHistoryWithMenu } from './dto/purchase.dto';

@Controller('restaurant')
export class RestaurantController {
  constructor(private service: RestaurantService) {}

  /**
   * [GET] /restaurant/
   * Get all restaurants without its menu list, with filter and pagination.
   * Query Params:
   * ?datetime=DD/MM/YYYY/HH:MM -> filter restaurant that are open at that datetime
   * ?itemsperpage=x -> display x items per page, by default 10
   * ?page=y -> display page y, by default 1
   * ?pricelte -> 'price less than or equal to' filter, default 999999 (arbirary large num)
   * ?pricegte -> 'price greater than or equal to' filter, default 0
   * ?dishlte -> 'dish count less than or equal to' filter, default 10000 (arbirary large)
   * ?dishgte -> 'dish count grater than or equal to' filter, default 1
   * ?sort -> sort alphabetically if true, otherwise false
   * Return 200 if success, with pagination info (total pages, whether next/prev page exist)
   * Return 400 if any optional query params format is invalid.
   */
  @Get()
  async listView(
    @Query() query: RestaurantQueryParams,
  ): Promise<RestaurantPaginator> {
    return await this.service.getAllRestaurants(query);
  }

  /**
   * [GET] /restaurant/search/
   * Requires 'q' query parameter for search query, optional pagination similar to above.
   * Get restaurants in descending order or relevance (by Jaro Winkler algo).
   * Return 200 if success, with relevance for each restaurant & pagination info.
   * Return 400 if any optional query params format is invalid.
   */
  @Get('search')
  async searchView(
    @Query() query: RestaurantSearchQueryParams,
  ): Promise<RestaurantSearchPaginator> {
    return this.service.searchRestaurantByRelevance(query);
  }

  /**
   * [POST] /restaurant/
   * Create a new restaurant instance, cashBalance defaulted to 0,
   * the user who makes the request becomes the restaurant owner (user).
   * Return 201 if success, with the new created instance.
   * Return 401 if not logged in.
   * Return 400 if it does not satisfy dto constraint.
   * Return 409 if conflict (same restaurantName).
   */
  @Post()
  @UseGuards(JwtGuard)
  async createView(
    @Body() dto: RestaurantDto,
    @GetUser() user: User,
  ): Promise<Restaurant> {
    return await this.service.createRestaurant(dto, user);
  }

  /**
   * [GET] /restaurant/me/
   * Get all restaurants created by the requesting user.
   * Return 200 if success, including all restaurant info except for menus.
   * Return 401 if not logged in.
   */
  @Get('me')
  @UseGuards(JwtGuard)
  async ownRestaurantView(@GetUser() user: User) {
    return this.service.getRestaurantByOwner(user);
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
   * Return 401 if not logged in.
   * Return 400 if it does not satisfy dto constraint.
   * Return 403 if not restaurant owner.
   * Return 404 if instance not found (invalid id).
   * Return 409 if dish name is duplicated in the same restaurant.
   */
  @Post(':id')
  @UseGuards(JwtGuard)
  async detailCreateView(
    @Param('id', ParseIntPipe) restaurantId: number,
    @Body() dto: MenuDto,
    @GetUser() user: User,
  ): Promise<MenuDto> {
    return await this.service.createMenuInRestaurant(restaurantId, dto, user);
  }

  /**
   * [PUT] /restaurant/:id/
   * Update existing restaurant instance, given its id.
   * Return 200 if success, with the new updated instance.
   * Return 401 if not logged in.
   * Return 400 if it does not satisfy dto constraint.
   * Return 403 if not restaurant owner.
   * Return 404 if instance not found (invalid id).
   */
  @Put(':id')
  @UseGuards(JwtGuard)
  async updateView(
    @Param('id', ParseIntPipe) restaurantId: number,
    @Body() dto: RestaurantDto,
    @GetUser() user: User,
  ): Promise<Restaurant> {
    return await this.service.updateRestaurantById(restaurantId, dto, user);
  }

  /**
   * [DELETE] /restaurant/:id/
   * Delete existing restaurant instance, given its id.
   * Return 204 if success.
   * Return 401 if not logged in.
   * Return 404 if instance not found (invalid id).
   * Return 403 if not restaurant owner.
   */
  @Delete(':id')
  @UseGuards(JwtGuard)
  @HttpCode(204)
  async deleteView(
    @Param('id', ParseIntPipe) restaurantId: number,
    @GetUser() user: User,
  ) {
    return await this.service.deleteRestaurantById(restaurantId, user);
  }
}

@Controller('menu')
export class MenuController {
  constructor(private service: MenuService) {}

  /**
   * [PUT] /menu/:id/
   * Update existing menu instance, given its id.
   * Return 200 if success, with the new updated instance.
   * Return 401 if not logged in.
   * Return 400 if it does not satisfy dto constraint.
   * Return 404 if instance not found (invalid id).
   * Return 403 if not restaurant owner of current dish.
   * Return 409 if dish name already exist in the same restaurant.
   */
  @Put(':id')
  @UseGuards(JwtGuard)
  async updateView(
    @Param('id', ParseIntPipe) menuId: number,
    @Body() dto: MenuDto,
    @GetUser() user: User,
  ): Promise<Menu> {
    return await this.service.updateMenuById(menuId, dto, user);
  }

  /**
   * [DELETE] /menu/:id/
   * Delete existing menu instance, given its id.
   * Return 204 if success, with the new created instance.
   * Return 401 if not logged in.
   * Return 404 if instance not found (invalid id).
   * Return 403 if not restaurant owner of current dish.
   */
  @Delete(':id')
  @UseGuards(JwtGuard)
  @HttpCode(204)
  async deleteView(
    @Param('id', ParseIntPipe) menuId: number,
    @GetUser() user: User,
  ): Promise<Menu> {
    return await this.service.deleteMenuById(menuId, user);
  }
}

@Controller('purchase')
export class PurchaseController {
  constructor(private service: PurchaseService) {}

  /**
   * [GET] /purchase/me/
   * Get all purchases made by the current requesting user.
   * Return 401 if not logged in.
   * Return 200 if success, with all purchases in a list (transactionDate, menu serialized).
   */
  @Get('me')
  @UseGuards(JwtGuard)
  async myPurchaseView(
    @GetUser() user: User,
  ): Promise<PurchaseHistoryWithMenu> {
    return this.service.getPurchaseByOwner(user);
  }

  /**
   * [GET] /purchase/restaurant/:id/
   * Get all purchases made in a restaurant, only available for restaurant owner.
   * Return 401 if not logged in.
   * Return 404 if restaurant id invalid.
   * Return 403 if restaurant not owned by requesting user.
   * Return 200 if success, with all purchases in a list.
   */
  @Get('restaurant/:id')
  @UseGuards(JwtGuard)
  async purchaseRestaurantView(
    @Param('id', ParseIntPipe) restaurantId: number,
    @GetUser() user: User,
  ): Promise<PurchaseHistoryWithMenu> {
    return this.service.getPurchaseByRestaurantId(restaurantId, user);
  }

  /**
   * [POST] /purchase/
   * Create multiple purchases at once, requires a list of (menuId-quantity) object.
   * Add appropriate cash balance to restaurant, decrease from user.
   * Return 201 if success, with the purchase instances created.
   * Return 401 if not logged in.
   * Return 400 if it does not satisfy dto constraint, or if store currently closed.
   * Return 404 if any of the menuId is invalid.
   * Return 402 if cash balance insufficient.
   */
  @Post()
  @UseGuards(JwtGuard)
  async purchaseDishView(
    @Body() dto: PurchaseDto,
    @GetUser() user: User,
  ): Promise<PurchaseHistory[]> {
    return await this.service.purchaseDish(dto, user);
  }
}
