import { Injectable } from '@nestjs/common';
import { ModelService } from 'src/model/model.service';
import * as argon from 'argon2';
import { parse } from 'date-fns';
import { restaurantAndMenuData } from './jsondata/restaurant_with_menu';
import { userAndPurchaseData } from './jsondata/users_with_purchase_history';
import {
  MenuData,
  RestaurantData,
  PurchaseHistoryData,
  UserData,
} from './sample.interface';

@Injectable()
export class SampleService {
  constructor(private model: ModelService) {}

  async createMenu(menu: MenuData, restaurantId: number) {
    await this.model.menu.create({
      data: {
        restaurant: {
          connect: {
            id: restaurantId,
          },
        },
        ...menu,
      },
    });
  }

  async createRestaurantAndMenu(restaurant: RestaurantData, adminId: number) {
    const { cashBalance, openingHours, restaurantName } = restaurant;
    const instance = await this.model.restaurant.create({
      data: {
        owner: {
          connect: {
            id: adminId,
          },
        },
        ...{ cashBalance, openingHours, restaurantName },
      },
    });
    restaurant.menu.forEach((menu: MenuData) => {
      this.createMenu(menu, instance.id);
    });
  }

  async createPurchase(purchase: PurchaseHistoryData, userId: number) {
    const dateObj = parse(
      purchase.transactionDate,
      'MM/dd/yyyy hh:mm a',
      new Date(),
    );
    const menu = await this.model.menu.findFirst({
      where: { dishName: purchase.dishName, price: purchase.transactionAmount },
    });
    await this.model.purchaseHistory.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        menu: {
          connect: {
            id: menu.id,
          },
        },
        transactionDate: dateObj,
      },
    });
  }

  async createUserAndPurchase(user: UserData) {
    const { cashBalance, name } = user;
    // ignore user with duplicated names from being created
    // unique constraint enforced for name as it is needed to login with password
    try {
      const instance = await this.model.user.create({
        data: {
          // all sample users simply have password 123
          password: await argon.hash('123'),
          ...{ cashBalance, name },
        },
      });
      user.purchaseHistory.forEach((purchase: PurchaseHistoryData) => {
        this.createPurchase(purchase, instance.id);
      });
    } catch (error) {}
  }

  async populateDatabase() {
    // admin will by default be set as creator of sample restaurants
    const admin = await this.model.user.create({
      data: {
        cashBalance: 0,
        name: 'admin',
        password: await argon.hash('123'),
      },
    });
    restaurantAndMenuData.forEach((restaurant: RestaurantData) => {
      this.createRestaurantAndMenu(restaurant, admin.id);
    });
    userAndPurchaseData.forEach((purchase: UserData) => {
      this.createUserAndPurchase(purchase);
    });
    // after calling this async function once, in total there should be:
    // 999 users, 9289 purchases, 18716 menus, 2203 restaurants
  }

  async resetDatabase() {
    await this.model.restaurant.deleteMany();
    await this.model.user.deleteMany();
    // menu and purchase will automatically be deleted too
    // in the schema the foreign key on_delete property is set to 'cascade'
  }
}
