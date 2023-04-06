import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
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

  async getRestaurantById(restaurantId: number): Promise<Restaurant> {
    const instance = await this.model.restaurant.findFirst({
      where: { id: restaurantId },
      include: { menus: true },
    });
    if (instance === null) throw new NotFoundException();
    return instance;
  }

  async createRestaurant(dto: RestaurantDto): Promise<Restaurant> {
    try {
      const instance = await this.model.restaurant.create({
        data: {
          cashBalance: 0,
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
  ): Promise<Menu> {
    const instance = await this.model.restaurant.findFirst({
      where: { id: restaurantId },
    });
    if (instance === null) throw new NotFoundException();
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
  ): Promise<Restaurant> {
    const instance = await this.model.restaurant.findFirst({
      where: { id: restaurantId },
    });
    if (instance === null) throw new NotFoundException();
    return await this.model.restaurant.update({
      where: { id: restaurantId },
      data: dto,
    });
  }

  async deleteRestaurantById(restaurantId: number): Promise<Restaurant> {
    const instance = await this.model.restaurant.findFirst({
      where: { id: restaurantId },
    });
    if (instance === null) throw new NotFoundException();
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

  async updateMenuById(menuId: number, dto: MenuDto): Promise<Menu> {
    const instance = await this.model.menu.findFirst({
      where: { id: menuId },
    });
    if (instance === null) throw new NotFoundException();
    return await this.model.menu.update({
      where: { id: menuId },
      data: dto,
    });
  }

  async deleteMenuById(menuId: number): Promise<Menu> {
    const instance = await this.model.menu.findFirst({
      where: { id: menuId },
    });
    if (instance === null) throw new NotFoundException();
    return await this.model.menu.delete({
      where: { id: menuId },
    });
  }
}
