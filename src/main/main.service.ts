import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ModelService } from '../model/model.service';
import { Restaurant, Menu, User, PurchaseHistory } from '@prisma/client';
import {
  RestaurantDto,
  RestaurantWithMenu,
  RestaurantQueryParams,
  RestaurantPaginator,
  RestaurantSearchQueryParams,
  RestaurantSearchPaginator,
} from './dto/restaurant.dto';
import { MenuDto } from './dto/menu.dto';
import { PurchaseDto } from './dto/purchase.dto';
import { paginate, isStoreOpen, getRelevance } from './main.utils';

@Injectable({})
export class RestaurantService {
  constructor(private model: ModelService) {}

  async searchRestaurantByRelevance(
    query: RestaurantSearchQueryParams,
  ): Promise<RestaurantSearchPaginator> {
    const results = await this.model.restaurant.findMany({
      include: { menus: true },
    });
    // for each restaurant:
    // get the relevance score between q and restaurant name
    // for each dish, get relevance score between q and dish name but minus 0.1
    // relevance score is the highest of all of those
    results.forEach((result) => {
      let relevanceList = [];
      relevanceList.push(getRelevance(query.q, result.restaurantName));
      result.menus.forEach((menu) => {
        relevanceList.push(getRelevance(query.q, menu.dishName) - 0.1);
      });
      result['relevance'] = Math.max(...relevanceList);
    });
    results.sort((a, b) => b['relevance'] - a['relevance']);
    // pagination
    const itemsPerPage: number = !query.itemsperpage ? 10 : query.itemsperpage;
    const page: number = !query.page ? 1 : query.page;
    return paginate(results, itemsPerPage, page);
  }

  async getAllRestaurants(
    query: RestaurantQueryParams,
  ): Promise<RestaurantPaginator> {
    let restaurants: RestaurantWithMenu[];
    if (query.datetime) {
      const dateTimeFilter = new Date(query.datetime);
      if (dateTimeFilter.toString() === 'Invalid Date')
        throw new BadRequestException('Invalid Date Time Given!');
      const restaurantsComplete = await this.model.restaurant.findMany({
        include: { menus: true },
      });
      restaurants = restaurantsComplete.filter((restaurant) =>
        isStoreOpen(dateTimeFilter, restaurant.openingHours),
      );
    } else {
      restaurants = await this.model.restaurant.findMany({
        include: { menus: true },
      });
    }

    // filter - list top y restaurants that have more or less than x number of dishes within a price range
    // default values when the query is empty
    const pricelte = query.pricelte ? query.pricelte : 999999;
    const pricegte = query.pricegte ? query.pricegte : 0;
    const dishlte = query.dishlte ? query.dishlte : 10000;
    const dishgte = query.dishgte ? query.dishgte : 1;
    // for each restaurant, calculate how many dish lies between the price range
    restaurants.forEach((restaurant) => {
      let dishCount = 0;
      restaurant.menus.forEach((menu) => {
        if (
          menu.price.toNumber() >= pricegte &&
          menu.price.toNumber() <= pricelte
        ) {
          dishCount += 1;
        }
      });
      restaurant['dishCount'] = dishCount;
    });
    // filter restaurant by the number of dish within that range
    const restaurantsNew = restaurants
      .filter(
        (restaurant) =>
          restaurant['dishCount'] >= dishgte &&
          restaurant['dishCount'] <= dishlte,
      )
      .map(
        // only return id, cashBalance, openingHours, restaurantName
        ({ id, cashBalance, openingHours, restaurantName }) => ({
          id,
          cashBalance,
          openingHours,
          restaurantName,
        }),
      );

    // sort alphabetically if sort is true
    const sortAlphabetically: boolean = query.sort ? query.sort : false;
    if (sortAlphabetically) {
      restaurantsNew.sort((a, b) =>
        a.restaurantName.localeCompare(b.restaurantName),
      );
    }

    // pagination
    // by default paginate 10 per page, go to page 1
    const itemsPerPage: number = !query.itemsperpage ? 10 : query.itemsperpage;
    const page: number = !query.page ? 1 : query.page;
    return paginate(restaurantsNew, itemsPerPage, page);
  }

  async getRestaurantById(restaurantId: number): Promise<Restaurant> {
    const instance = await this.model.restaurant.findFirst({
      where: { id: restaurantId },
      include: { menus: true },
    });
    if (instance === null) throw new NotFoundException();
    return instance;
  }

  async createRestaurant(dto: RestaurantDto, user: User): Promise<Restaurant> {
    try {
      const instance = await this.model.restaurant.create({
        data: {
          cashBalance: 0,
          owner: {
            connect: {
              id: user.id,
            },
          },
          ...dto,
        },
      });
      return instance;
    } catch (error) {
      // if violates unique constraint
      if (error.code === 'P2002')
        throw new ConflictException('Name should be unique!');
      throw new BadRequestException(error);
    }
  }

  async createMenuInRestaurant(
    restaurantId: number,
    dto: MenuDto,
    user: User,
  ): Promise<Menu> {
    const instance = await this.model.restaurant.findFirst({
      where: { id: restaurantId },
    });
    if (instance === null) throw new NotFoundException();
    if (user.id !== instance.ownerId)
      throw new ForbiddenException('Restaurant Owner Required!');
    return await this.model.menu.create({
      data: {
        restaurant: {
          connect: {
            id: restaurantId,
          },
        },
        ...dto,
      },
    });
  }

  async updateRestaurantById(
    restaurantId: number,
    dto: RestaurantDto,
    user: User,
  ): Promise<Restaurant> {
    const instance = await this.model.restaurant.findFirst({
      where: { id: restaurantId },
    });
    if (instance === null) throw new NotFoundException();
    if (user.id !== instance.ownerId)
      throw new ForbiddenException('Restaurant Owner Required!');
    return await this.model.restaurant.update({
      where: { id: restaurantId },
      data: dto,
    });
  }

  async deleteRestaurantById(
    restaurantId: number,
    user: User,
  ): Promise<Restaurant> {
    const instance = await this.model.restaurant.findFirst({
      where: { id: restaurantId },
    });
    if (instance === null) throw new NotFoundException();
    if (user.id !== instance.ownerId)
      throw new ForbiddenException('Restaurant Owner Required!');
    return await this.model.restaurant.delete({
      where: {
        id: restaurantId,
      },
    });
  }
}

@Injectable({})
export class MenuService {
  constructor(private model: ModelService) {}

  async updateMenuById(
    menuId: number,
    dto: MenuDto,
    user: User,
  ): Promise<Menu> {
    const menu = await this.model.menu.findFirst({
      where: { id: menuId },
    });
    if (menu === null) throw new NotFoundException();
    const restaurant = await this.model.restaurant.findFirst({
      where: { id: menu.restaurantId },
    });
    if (user.id !== restaurant.ownerId)
      throw new ForbiddenException('Restaurant Owner Required!');
    return await this.model.menu.update({
      where: { id: menuId },
      data: dto,
    });
  }

  async deleteMenuById(menuId: number, user: User): Promise<Menu> {
    const menu = await this.model.menu.findFirst({
      where: { id: menuId },
    });
    if (menu === null) throw new NotFoundException();
    const restaurant = await this.model.restaurant.findFirst({
      where: { id: menu.restaurantId },
    });
    if (user.id !== restaurant.ownerId)
      throw new ForbiddenException('Restaurant Owner Required!');
    return await this.model.menu.delete({
      where: { id: menuId },
    });
  }
}

@Injectable({})
export class PurchaseService {
  constructor(private model: ModelService) {}

  async getMenuById(menuId: number): Promise<Menu> {
    const menu = await this.model.menu.findFirst({
      where: { id: menuId },
    });
    return menu;
  }

  async purchaseDish(dto: PurchaseDto, user: User): Promise<PurchaseHistory[]> {
    // calculate total price, need to use for loop to await
    let totalPrice = 0;
    for (let i = 0; i < dto.items.length; i++) {
      let menu = await this.model.menu.findFirst({
        where: { id: dto.items[i].menuId },
      });
      if (menu === null) throw new BadRequestException('Invalid Menu ID');
      totalPrice += menu.price.toNumber() * dto.items[i].quantity;
    }

    // if not enough money from user's balance, return 402
    if (user.cashBalance.toNumber() < totalPrice)
      throw new HttpException('Payment Required', HttpStatus.PAYMENT_REQUIRED);

    // else create transaction for each dish item purchased, increase restaurant balance
    let purchases = [];
    for (let i = 0; i < dto.items.length; i++) {
      let menu = await this.model.menu.findFirst({
        where: { id: dto.items[i].menuId },
      });
      let purchase = await this.model.purchaseHistory.create({
        data: {
          menu: {
            connect: {
              id: menu.id,
            },
          },
          user: {
            connect: {
              id: user.id,
            },
          },
          transactionDate: new Date(),
        },
      });
      purchases.push(purchase);
      const restaurant = await this.model.restaurant.findFirst({
        where: { id: menu.id },
      });
      await this.model.restaurant.update({
        where: { id: menu.restaurantId },
        data: {
          // optimistic locking
          cashBalance:
            restaurant.cashBalance.toNumber() + menu.price.toNumber(),
        },
      });
    }

    // decrement user's balance and update
    // we assume the same user can't make similar request in very close time
    const newBalance = user.cashBalance.toNumber() - totalPrice;
    await this.model.user.update({
      where: { name: user.name },
      data: {
        cashBalance: newBalance,
      },
    });

    return purchases;
  }
}
