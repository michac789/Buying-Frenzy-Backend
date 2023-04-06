import { Injectable, NotFoundException } from '@nestjs/common';
import { ModelService } from 'src/model/model.service';
import { Restaurant, Menu } from '@prisma/client';
import { RestaurantDto } from './dto/restaurant.dto';
import { MenuDto } from './dto/menu.dto';

@Injectable({})
export class MainService {
  test() {
    console.log('test');
    return 'test';
  }
}

@Injectable({})
export class RestaurantService {
  constructor(private model: ModelService) {}

  /**
   * Return all restaurants (without showing menu).
   * TODO - add query param to filter based on date & time
   * TODO - add pagination
   */
  async getAllRestaurants(): Promise<Restaurant[]> {
    return await this.model.restaurant.findMany();
  }

  /**
   * Get a restaurant instance (including all menu), given its id.
   * Returns 404 if id is invalid.
   */
  async getRestaurantById(restaurantId: number): Promise<Restaurant> {
    const instance = await this.model.restaurant.findFirst({
      where: { id: restaurantId },
      include: { menus: true },
    });
    if (instance === null) throw new NotFoundException();
    return instance;
  }

  /**
   * Create a new restaurant instance.
   * TODO - add validation (unique values, not allow negative, not allow empty)
   */
  async createRestaurant(dto: RestaurantDto): Promise<Restaurant> {
    const instance = await this.model.restaurant.create({
      data: {
        cashBalance: 0,
        ...dto,
      },
    });
    return instance;
  }

  async createMenuInRestaurant(
    restaurantId: number,
    dto: MenuDto,
  ): Promise<Menu> {
    const instance = await this.model.menu.create({
      data: {
        restaurant: {
          connect: {
            id: restaurantId,
          },
        },
        ...dto,
      },
    });
    return instance;
  }

  async updateRestaurant(
    restaurantId: number,
    dto: RestaurantDto,
  ): Promise<Restaurant> {
    return await this.model.restaurant.update({
      where: { id: restaurantId },
      data: dto,
    });
  }

  async deleteRestaurant(restaurantId: number): Promise<Restaurant> {
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

  async updateMenu(menuId: number, dto: MenuDto): Promise<Menu> {
    return await this.model.menu.update({
      where: { id: menuId },
      data: dto,
    });
  }

  async deleteMenu(menuId: number): Promise<Menu> {
    return await this.model.menu.delete({
      where: { id: menuId },
    });
  }
}
