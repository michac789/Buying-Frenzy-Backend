import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { ModelService } from '../model/model.service';
import * as argon from 'argon2';
import * as request from 'supertest';
import { Menu, Restaurant, User } from '@prisma/client';

describe('App Main Customized Endpoint e2e', () => {
  let app: INestApplication;
  let model: ModelService;
  let accessToken1: string, accessToken2: string;
  let sampleUser1: User, sampleUser2: User;
  let resto1: Restaurant, resto2: Restaurant, resto3: Restaurant;
  let menu1: Menu, menu2: Menu, menu3: Menu, menu4: Menu, menu5: Menu;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3336);

    // make sure database is initially empty
    model = app.get(ModelService);
    await model.cleanDb();

    // create two sample user
    sampleUser1 = await model.user.create({
      data: {
        cashBalance: 0,
        name: 'michael',
        password: await argon.hash('123'),
      },
    });
    sampleUser2 = await model.user.create({
      data: {
        cashBalance: 0,
        name: 'andrew',
        password: await argon.hash('123'),
      },
    });

    // get access token
    const loginEndpoint = '/sso/login/';
    const sendData = {
      name: 'michael',
      password: '123',
    };
    const responseToken = await request(app.getHttpServer())
      .post(loginEndpoint)
      .send(sendData);
    accessToken1 = responseToken.body.accessToken;

    const sendData2 = {
      name: 'andrew',
      password: '123',
    };
    const responseToken2 = await request(app.getHttpServer())
      .post(loginEndpoint)
      .send(sendData2);
    accessToken2 = responseToken2.body.accessToken;

    /**
     * Sample Data (for testing purpose)
     *
     * > resto1 (by sampleUser1): 'Singapore Chicken Rice'
     * openingHour: 10:00/21:00/10:00/21:00/09:45/18:45/00:00/00:00/09:45/18:45/11:00/23:30/10:15/19:45
     * dish1: Chicken Rice (4)
     * dish2: Pork Rice (4.5)
     *
     * > resto2 (by sampleUser1): 'Economic Bee Hon'
     * openingHour: 10:00/19:30/10:00/19:30/10:00/19:30/10:00/19:30/11:15/22:45/11:15/22:45/12:00/19:00
     * dish3: Fried Bee Hon (4.99)
     *
     * > resto3 (by sampleUser2): 'Fun Pasta'
     * openingHour: 11:00/20:15/10:00/19:30/10:00/19:30/00:00/00:00/00:00/00:00/05:15/22:45/07:00/20:10
     * dish4: bolognese spaghetti (7.6)
     * dish5: cheese beef fusilli (8.72)
     */
    resto1 = await model.restaurant.create({
      data: {
        restaurantName: 'Singapore Chicken Rice',
        cashBalance: 0,
        openingHours:
          '10:00/21:00/10:00/21:00/09:45/18:45/00:00/00:00/09:45/18:45/11:00/23:30/10:15/19:45',
        ownerId: sampleUser1.id,
      },
    });
    resto2 = await model.restaurant.create({
      data: {
        restaurantName: 'Economic Bee Hon',
        cashBalance: 0,
        openingHours:
          '10:00/19:30/10:00/19:30/10:00/19:30/10:00/19:30/11:15/22:45/11:15/22:45/12:00/19:00',
        ownerId: sampleUser1.id,
      },
    });
    resto3 = await model.restaurant.create({
      data: {
        restaurantName: 'Fun Pasta',
        cashBalance: 0,
        openingHours:
          '11:00/20:15/10:00/19:30/10:00/19:30/00:00/00:00/00:00/00:00/05:15/22:45/07:00/20:10',
        ownerId: sampleUser2.id,
      },
    });
    menu1 = await model.menu.create({
      data: {
        dishName: 'Chicken Rice',
        price: 4,
        restaurantId: resto1.id,
      },
    });
    menu2 = await model.menu.create({
      data: {
        dishName: 'Pork Rice',
        price: 4.5,
        restaurantId: resto1.id,
      },
    });
    menu3 = await model.menu.create({
      data: {
        dishName: 'Fried Bee Hon',
        price: 4.99,
        restaurantId: resto2.id,
      },
    });
    menu4 = await model.menu.create({
      data: {
        dishName: 'bolognese spaghetti',
        price: 7.6,
        restaurantId: resto3.id,
      },
    });
    menu5 = await model.menu.create({
      data: {
        dishName: 'cheese beef fusilli',
        price: 8.72,
        restaurantId: resto3.id,
      },
    });
  });

  afterAll(async () => await model.cleanDb());

  describe('[GET] /restaurant/search/', () => {
    const restaurantSearchEndpoint = '/restaurant/search/';

    it('Bad Request Case 1: query q is missing', async () => {
      const response = await request(app.getHttpServer()).get(
        restaurantSearchEndpoint,
      );
      expect(response.status).toBe(400);
    });

    it('Bad Request Case 2: itemsperpage is not a number', async () => {
      const response = await request(app.getHttpServer())
        .get(restaurantSearchEndpoint)
        .query({
          q: 'abc',
          itemsperpage: 'def',
        });
      expect(response.status).toBe(400);
    });

    it('Bad Request Case 3: page is not a number', async () => {
      const response = await request(app.getHttpServer())
        .get(restaurantSearchEndpoint)
        .query({
          q: 'abc',
          itemsperpage: 2,
          page: 'somestring',
        });
      expect(response.status).toBe(400);
    });

    it('Bad Request Case 4: page is invalid (negative value)', async () => {
      const response = await request(app.getHttpServer())
        .get(restaurantSearchEndpoint)
        .query({
          q: 'abc',
          itemsperpage: 2,
          page: '-1',
        });
      expect(response.status).toBe(400);
    });

    it('Bad Request Case 5: page is invalid (greater than max page)', async () => {
      const response = await request(app.getHttpServer())
        .get(restaurantSearchEndpoint)
        .query({
          q: 'abc',
          itemsperpage: 2,
          page: 4, // only 3 pages as there are 5 items, paginate 2 per page: 2-2-1
        });
      expect(response.status).toBe(400);
    });

    it('Success Case 1: query is almost the same to menu, check query and pagination', async () => {
      const response = await request(app.getHttpServer())
        .get(restaurantSearchEndpoint)
        .query({
          q: 'bee hoon fry',
          itemsperpage: '1',
          page: '1',
        });
      expect(response.status).toBe(200);
      expect(response.body.pagination).toEqual({
        totalPages: 3,
        totalItems: 3,
        hasNext: true,
        hasPrev: false,
      });
      expect(response.body.items[0].id).toBe(resto2.id);
      expect(response.body.items[0].restaurantName).toBe('Economic Bee Hon');
    });

    it('Success Case 2: query is quite different, check ranking based on relevance & pagination', async () => {
      const response = await request(app.getHttpServer())
        .get(restaurantSearchEndpoint)
        .query({
          q: 'fried rice',
        });
      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(3);
      expect(response.body.items[0].id).toBe(resto2.id);
      expect(response.body.items[1].id).toBe(resto1.id);
      expect(response.body.items[2].id).toBe(resto3.id);
      expect(response.body.items[2].relevance).toBeLessThanOrEqual(
        response.body.items[1].relevance,
      );
      expect(response.body.items[1].relevance).toBeLessThanOrEqual(
        response.body.items[0].relevance,
      );
      expect(response.body.pagination).toEqual({
        totalPages: 1,
        totalItems: 3,
        hasNext: false,
        hasPrev: false,
      });
    });
  });

  describe('[GET] /restaurant/', () => {
    const restaurantGetEndpoint = '/restaurant/';

    it('Bad Request Case 1: invalid date time format case 1', async () => {
      const response = await request(app.getHttpServer())
        .get(restaurantGetEndpoint)
        .query({
          datetime: '11/04/2023-12:00',
        });
      expect(response.status).toBe(400);
    });

    it('Bad Request Case 2: invalid date time format case 2', async () => {
      const response = await request(app.getHttpServer())
        .get(restaurantGetEndpoint)
        .query({
          datetime: '2023/11/04/13:00',
        });
      expect(response.status).toBe(400);
    });

    it('Bad Request Case 3: itemsperpage and page should be number', async () => {
      const response = await request(app.getHttpServer())
        .get(restaurantGetEndpoint)
        .query({
          itemsperpage: '3',
          page: 'a',
        });
      expect(response.status).toBe(400);
    });

    it('Bad Request Case 4: pricelte should be a number', async () => {
      const response = await request(app.getHttpServer())
        .get(restaurantGetEndpoint)
        .query({
          pricelte: 'abc',
        });
      expect(response.status).toBe(400);
    });

    it('Bad Request Case 5: pricegte should be a number', async () => {
      const response = await request(app.getHttpServer())
        .get(restaurantGetEndpoint)
        .query({
          pricegte: '??',
        });
      expect(response.status).toBe(400);
    });

    it('Bad Request Case 6: dishlte should be an integer', async () => {
      const response = await request(app.getHttpServer())
        .get(restaurantGetEndpoint)
        .query({
          dishlte: '3.1',
        });
      expect(response.status).toBe(400);
    });

    it('Bad Request Case 7: dishgte should be an integer', async () => {
      const response = await request(app.getHttpServer())
        .get(restaurantGetEndpoint)
        .query({
          dishgte: 'abc',
        });
      expect(response.status).toBe(400);
    });

    it('Success Case 1: basic get functionality with no query params, check pagination info', async () => {
      const response = await request(app.getHttpServer()).get(
        restaurantGetEndpoint,
      );
      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(3);
      expect(response.body.items[0].id).toBe(resto1.id);
      expect(response.body.items[1].id).toBe(resto2.id);
      expect(response.body.items[2].id).toBe(resto3.id);
      expect(response.body.pagination).toEqual({
        totalPages: 1,
        totalItems: 3,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('Success Case 2: check sort functionality when true', async () => {
      const response = await request(app.getHttpServer())
        .get(restaurantGetEndpoint)
        .query({
          sort: 'true',
        });
      expect(response.status).toBe(200);
      expect(response.body.items[0].id).toBe(resto2.id);
      expect(response.body.items[1].id).toBe(resto3.id);
      expect(response.body.items[2].id).toBe(resto1.id);
    });

    it('Success Case 3: check sort functionality when not true does not do anything', async () => {
      const response = await request(app.getHttpServer())
        .get(restaurantGetEndpoint)
        .query({
          sort: 'somerandomstringthatisnottrue',
        });
      expect(response.status).toBe(200);
      expect(response.body.items[0].id).toBe(resto1.id);
      expect(response.body.items[1].id).toBe(resto2.id);
      expect(response.body.items[2].id).toBe(resto3.id);
    });

    it('Success Case 4: check price lte filter individually', async () => {
      // filter all restaurant that has at least one dish with price less than or equal to 4.99
      const response = await request(app.getHttpServer())
        .get(restaurantGetEndpoint)
        .query({
          pricelte: '4.99',
        });
      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(2);
      expect(response.body.items[0].id).toBe(resto1.id);
      expect(response.body.items[1].id).toBe(resto2.id);
    });

    it('Success Case 5: check price gte filter individually, check pagination', async () => {
      // filter all restaurant that has at least one dish with price more than or equal to 10
      const response = await request(app.getHttpServer())
        .get(restaurantGetEndpoint)
        .query({
          pricegte: '10',
        });
      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(0);
      expect(response.body.pagination).toEqual({
        totalPages: 0,
        totalItems: 0,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('Success Case 6: check dish lte filter individually, check pagination', async () => {
      // filter all restaurant that has less than or equal to 1 dish
      const response = await request(app.getHttpServer())
        .get(restaurantGetEndpoint)
        .query({
          dishlte: '1',
        });
      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(1);
      expect(response.body.items[0].id).toBe(resto2.id);
      expect(response.body.pagination).toEqual({
        totalPages: 1,
        totalItems: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('Success Case 7: check dish gte filter individually, check pagination', async () => {
      // filter all restaurant that has more than or equal to 2 dish
      const response = await request(app.getHttpServer())
        .get(restaurantGetEndpoint)
        .query({
          dishgte: '2',
          itemsperpage: '1',
          page: '2',
        });
      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(1);
      expect(response.body.items[0].id).toBe(resto3.id);
      expect(response.body.pagination).toEqual({
        totalPages: 2,
        totalItems: 2,
        hasNext: false,
        hasPrev: true,
      });
    });

    it('Success Case 8: check multiple filters', async () => {
      // filter all restaurant that has more than 1 dish with price range 5-7.7
      const response = await request(app.getHttpServer())
        .get(restaurantGetEndpoint)
        .query({
          dishgte: '1',
          pricegte: '5',
          pricelte: '7.7',
        });
      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(1);
      expect(response.body.items[0].id).toBe(resto3.id);
    });

    it('Success Case 9: check multiple filters II', async () => {
      // filter all restaurant that has 1 dish with price less than 5, sort alphabetically
      const response = await request(app.getHttpServer())
        .get(restaurantGetEndpoint)
        .query({
          dishlte: '1',
          pricelte: '5',
          sort: 'true',
        });
      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(1);
      expect(response.body.items[0].id).toBe(resto2.id);
    });
  });

  describe('[POST] /purchase/', () => {
    const restaurantPurchaseEndpoint = '/purchase/';
    const topupEndpoint = '/sso/user/topup/';

    it('Return 401 if not logged in', async () => {
      const sendData = {
        items: [
          {
            menuId: menu1.id,
            quantity: 2,
          },
          {
            menuId: menu2.id,
            quantity: 1,
          },
        ],
      };
      const response = await request(app.getHttpServer())
        .post(restaurantPurchaseEndpoint)
        .send(sendData);
      expect(response.status).toBe(401);
      // top up user1 balance (to be used for next test cases)
      const sendData2 = { additionalCashBalance: 100 };
      await request(app.getHttpServer())
        .post(topupEndpoint)
        .send(sendData2)
        .set('Authorization', `Bearer ${accessToken1}`);
    });

    it('Return 400 if any quantity is non-negative', async () => {
      const sendData = {
        items: [
          {
            menuId: menu1.id,
            quantity: 0,
          },
          {
            menuId: menu2.id,
            quantity: 1,
          },
        ],
      };
      const response = await request(app.getHttpServer())
        .post(restaurantPurchaseEndpoint)
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(sendData);
      expect(response.status).toBe(400);
    });

    it('Return 400 if items list is empty', async () => {
      const sendData = {
        items: [],
      };
      const response = await request(app.getHttpServer())
        .post(restaurantPurchaseEndpoint)
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(sendData);
      expect(response.status).toBe(400);
    });

    it('Return 404 if any menu id is invalid', async () => {
      const sendData = {
        items: [
          {
            menuId: 9999999,
            quantity: 2,
          },
          {
            menuId: menu2.id,
            quantity: 1,
          },
        ],
      };
      const response = await request(app.getHttpServer())
        .post(restaurantPurchaseEndpoint)
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(sendData);
      expect(response.status).toBe(400);
    });

    it('Return 402 if cashBalance insufficient', async () => {
      const sendData = {
        items: [
          {
            menuId: menu1.id,
            quantity: 2,
          },
          {
            menuId: menu2.id,
            quantity: 1,
          },
        ],
      };
      const response = await request(app.getHttpServer())
        .post(restaurantPurchaseEndpoint)
        .set('Authorization', `Bearer ${accessToken2}`) // user 2 has zero balance
        .send(sendData);
      expect(response.status).toBe(402);
    });

    it('Return 201 if success I, check restaurant balance added, user balance deducted, purchase created', async () => {
      const sendData = {
        items: [
          {
            menuId: menu1.id,
            quantity: 2,
          },
          {
            menuId: menu2.id,
            quantity: 1,
          },
        ],
      };
      const response = await request(app.getHttpServer())
        .post(restaurantPurchaseEndpoint)
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(sendData);
      expect(response.status).toBe(201);

      // restaurant balance added
      const resto = await model.restaurant.findFirst({
        where: { id: resto1.id },
      });
      expect(resto.cashBalance.toString()).toBe('12.5');

      // user's balance deducted
      const user = await model.user.findFirst({
        where: { id: sampleUser1.id },
      });
      expect(user.cashBalance.toString()).toBe('87.5');

      // purchase return value
      expect(response.body.length).toBe(3);
      expect(response.body[0].menuId).toBe(menu1.id);
      expect(response.body[0].userId).toBe(sampleUser1.id);
      expect(response.body[1].menuId).toBe(menu1.id);
      expect(response.body[1].userId).toBe(sampleUser1.id);
      expect(response.body[2].menuId).toBe(menu2.id);
      expect(response.body[2].userId).toBe(sampleUser1.id);
    });

    it('Return 201 if success II, check restaurant balance added, user balance deducted, purchase created', async () => {
      const sendData = {
        items: [
          {
            menuId: menu3.id,
            quantity: 1,
          },
          {
            menuId: menu2.id,
            quantity: 1,
          },
        ],
      };
      const response = await request(app.getHttpServer())
        .post(restaurantPurchaseEndpoint)
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(sendData);
      expect(response.status).toBe(201);

      // restaurant balance added
      const restoA = await model.restaurant.findFirst({
        where: { id: resto1.id },
      });
      expect(restoA.cashBalance.toString()).toBe('17');
      const restoB = await model.restaurant.findFirst({
        where: { id: resto2.id },
      });
      expect(restoB.cashBalance.toString()).toBe('4.99');

      // user's balance deducted
      const user = await model.user.findFirst({
        where: { id: sampleUser1.id },
      });
      expect(user.cashBalance.toString()).toBe('78.01');

      // purchase return value
      expect(response.body.length).toBe(2);
      expect(response.body[0].menuId).toBe(menu3.id);
      expect(response.body[0].userId).toBe(sampleUser1.id);
      expect(response.body[1].menuId).toBe(menu2.id);
      expect(response.body[1].userId).toBe(sampleUser1.id);
    });
  });

  describe('[GET] /purchase/me/', () => {
    const myPurchaseEndpoint = '/purchase/me/';

    it('Return 401 if not logged in', async () => {
      const response = await request(app.getHttpServer()).get(
        myPurchaseEndpoint,
      );
      expect(response.status).toBe(401);
    });

    it('Return 200 if success, with all purchases made by requesting user', async () => {
      const response = await request(app.getHttpServer())
        .get(myPurchaseEndpoint)
        .set('Authorization', `Bearer ${accessToken1}`);
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(5);
      expect(response.body[0].menuId).toBe(menu1.id);
      expect(response.body[1].menuId).toBe(menu1.id);
      expect(response.body[2].menuId).toBe(menu2.id);
      expect(response.body[3].menuId).toBe(menu3.id);
      expect(response.body[4].menuId).toBe(menu2.id);
      expect(response.body[4].menuName).toBe('Pork Rice');
      expect(response.body[4].menuPrice).toBe('4.5');
    });

    it('Return 200 if success II, with all purchases made by requesting user', async () => {
      const response = await request(app.getHttpServer())
        .get(myPurchaseEndpoint)
        .set('Authorization', `Bearer ${accessToken2}`); // this user haven't purchase anything yet
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(0);
    });
  });

  describe('[GET] /purchase/restaurant/:id/', () => {
    const getRestaurantPurchaseEndpoint = (id: number) =>
      `/purchase/restaurant/${id}/`;

    it('Return 401 if not logged in', async () => {
      const response = await request(app.getHttpServer()).get(
        getRestaurantPurchaseEndpoint(resto1.id),
      );
      expect(response.status).toBe(401);
    });

    it('Return 404 if restaurant id invalid', async () => {
      const response = await request(app.getHttpServer())
        .get(getRestaurantPurchaseEndpoint(9999999))
        .set('Authorization', `Bearer ${accessToken1}`);
      expect(response.status).toBe(404);
    });

    it('Return 403 if restaurant not owned by requesting user', async () => {
      const response = await request(app.getHttpServer())
        .get(getRestaurantPurchaseEndpoint(resto1.id))
        .set('Authorization', `Bearer ${accessToken2}`);
      expect(response.status).toBe(403);
    });

    it('Return 200 if success, with all purchases of the dishes in that restaurant', async () => {
      const response = await request(app.getHttpServer())
        .get(getRestaurantPurchaseEndpoint(resto2.id))
        .set('Authorization', `Bearer ${accessToken1}`);
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].menuName).toBe(menu3.dishName);
    });

    it('Return 200 if success II, with all purchases of the dishes in that restaurant', async () => {
      const response = await request(app.getHttpServer())
        .get(getRestaurantPurchaseEndpoint(resto3.id))
        .set('Authorization', `Bearer ${accessToken2}`);
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(0);
    });
  });
});
