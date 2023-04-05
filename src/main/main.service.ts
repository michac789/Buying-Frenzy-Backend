import { Injectable } from "@nestjs/common";
import { ModelService } from "src/model/model.service";
import { Restaurant } from "@prisma/client";
import { RestaurantDto } from "./dto/restaurant.dto";


@Injectable({})
export class MainService {
  test() {
    console.log('test');
    return 'test'
  }
}

@Injectable({})
export class RestaurantService {
  constructor(private model: ModelService) {}

  async getAllRestaurants(): Promise<Restaurant[]> {
    return await this.model.restaurant.findMany()
  }

  async getRestaurantById(
    restaurantId: number
  ): Promise<Restaurant> {
    return await this.model.restaurant.findFirst({
      where: {
        id: restaurantId,
      }
    })
  }

  async createRestaurant(
    dto: RestaurantDto
  ): Promise<Restaurant> {
    const instance = await this.model.restaurant.create({
      data: {
        cashBalance: 0,
        ...dto
      },
    })
    return instance
  }

  async updateRestaurant(
    restaurantId: number,
    dto: RestaurantDto,
  ): Promise<Restaurant> {
    return await this.model.restaurant.update({
      where: {
        id: restaurantId,
      },
      data: {
        ...dto,
      },
    })
  }

  async deleteRestaurant(
    restaurantId: number,
  ): Promise<Restaurant> {
    return await this.model.restaurant.delete({
      where: {
        id: restaurantId,
      },
    })
  }
}
