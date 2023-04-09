import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { ModelService } from '../model/model.service';
import * as argon from 'argon2';
import * as request from 'supertest';
import { Menu, Restaurant, User } from '@prisma/client';
import { IsRequiredDateTimeFormat } from '../main/dto/restaurant.dto';

describe('App Main (Restaurant Generic Endpoints) e2e', () => {
  let app: INestApplication;
  let model: ModelService;
  let accessToken1: string;
  let accessToken2: string;
  let sampleUser1: User;
  let sampleRestaurant: Restaurant;
  let sampleMenu1: Menu;
  let sampleMenu2: Menu;

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
    await app.listen(3335);

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
    await model.user.create({
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
  });

  afterAll(async () => await model.cleanDb());

  describe('[POST] /restaurant/ (restaurant-create)', () => {
    const restaurantCreateEndpoint = '/restaurant/';

    it('Return 401 if not logged in', async () => {
      const sendData = {
        openingHours:
          '10:00/21:00/10:00/21:00/09:45/18:45/00:00/00:00/09:45/18:45/11:00/23:30/10:15/19:45',
        restaurantName: 'newResto',
      };
      sampleUser1;
      const response = await request(app.getHttpServer())
        .post(restaurantCreateEndpoint)
        .send(sendData);
      expect(response.status).toBe(401);
    });

    it('Return 400 if openingHours is not given or empty string', async () => {
      const sendData = {
        restaurantName: 'newResto',
      };
      const response = await request(app.getHttpServer())
        .post(restaurantCreateEndpoint)
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(sendData);
      expect(response.status).toBe(400);
    });

    it('Return 400 if restaurant name is not given or empty string', async () => {
      const sendData = {
        openingHours:
          '10:00/21:00/10:00/21:00/09:45/18:45/00:00/00:00/09:45/18:45/11:00/23:30/10:15/19:45',
        restaurantName: '',
      };
      const response = await request(app.getHttpServer())
        .post(restaurantCreateEndpoint)
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(sendData);
      expect(response.status).toBe(400);
    });

    it('Return 400 if openingHours is invalid format (case 1)', async () => {
      // less than 14 hours given
      const sendData = {
        openingHours:
          '10:00/21:00/10:00/21:00/09:45/18:45/00:00/00:00/09:45/18:45/11:00/10:15/19:45',
        restaurantName: 'newResto',
      };
      const response = await request(app.getHttpServer())
        .post(restaurantCreateEndpoint)
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(sendData);
      expect(response.status).toBe(400);
    });

    it('Return 400 if openingHours is invalid format (case 2)', async () => {
      // invalid hour
      const sendData = {
        openingHours:
          '10:00/21:00/11:00/25:00/09:45/18:45/00:00/00:00/09:45/18:45/11:00/23:30/10:15/19:45',
        restaurantName: 'newResto',
      };
      const response = await request(app.getHttpServer())
        .post(restaurantCreateEndpoint)
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(sendData);
      expect(response.status).toBe(400);
    });

    it('Return 400 if openingHours is invalid format (case 3)', async () => {
      // invalid delimiter
      const sendData = {
        openingHours:
          '10:00/21:00/10:00/21:00/09:45/18:45/00:00/00:00/09:45/18:45/11:00//23:30/10:15/19:45',
        restaurantName: 'newResto',
      };
      const response = await request(app.getHttpServer())
        .post(restaurantCreateEndpoint)
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(sendData);
      expect(response.status).toBe(400);
    });

    it('Return 201 if success, verify creation, cashBalance initialize to zero, creator is the restaurant owner', async () => {
      const sendData = {
        openingHours:
          '10:00/21:00/10:00/21:00/09:45/18:45/00:00/00:00/09:45/18:45/11:00/23:30/10:15/19:45',
        restaurantName: 'newResto',
      };
      const response = await request(app.getHttpServer())
        .post(restaurantCreateEndpoint)
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(sendData);
      expect(response.status).toBe(201);
      expect(response.body.restaurantName).toBe('newResto');
      expect(response.body.openingHours).toBe(
        '10:00/21:00/10:00/21:00/09:45/18:45/00:00/00:00/09:45/18:45/11:00/23:30/10:15/19:45',
      );

      const newResto = await model.restaurant.findFirst({
        where: { id: response.body.id },
      });
      sampleRestaurant = newResto; // to be used further later in testing
      expect(newResto).toBeDefined();
      expect(newResto.cashBalance.toString()).toBe('0'); // cashBalance initially 0 when created
      expect(newResto.restaurantName).toBe('newResto');
      expect(newResto.openingHours).toBe(
        '10:00/21:00/10:00/21:00/09:45/18:45/00:00/00:00/09:45/18:45/11:00/23:30/10:15/19:45',
      );
      expect(newResto.ownerId.toString()).toBe(sampleUser1.id.toString()); // automatically assign creator as owner
    });
  });

  describe('[GET] /restaurant/:id/ (restaurant-detail-get)', () => {
    const getRestaurantDetailEndpoint = (id: number) => `/restaurant/${id}/`;

    it('Return 404 if id invalid (restaurant not found)', async () => {
      const response = await request(app.getHttpServer()).get(
        getRestaurantDetailEndpoint(999999999),
      ); // random arbitrary large id that does not exist
      expect(response.status).toBe(404);
    });

    it('Return 200 if success (when logged in with any account), get restaurant details', async () => {
      const response = await request(app.getHttpServer())
        .get(getRestaurantDetailEndpoint(sampleRestaurant.id))
        .set('Authorization', `Bearer ${accessToken2}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: sampleRestaurant.id,
        cashBalance: '0',
        openingHours:
          '10:00/21:00/10:00/21:00/09:45/18:45/00:00/00:00/09:45/18:45/11:00/23:30/10:15/19:45',
        restaurantName: 'newResto',
        ownerId: sampleUser1.id,
        menus: [],
      });
    });

    it('Return 200 if success even without log in, get restaurant details including all menus', async () => {
      // create some menu for sample data
      sampleMenu1 = await model.menu.create({
        // store this is sampleMenu1, use for deletion testing later on
        data: {
          dishName: 'dish1',
          price: 2.6,
          restaurantId: sampleRestaurant.id,
        },
      });
      sampleMenu2 = await model.menu.create({
        data: {
          dishName: 'dish2',
          price: 3.55,
          restaurantId: sampleRestaurant.id,
        },
      });

      // verify 200 and return restaurant details with the list of dishes
      const response = await request(app.getHttpServer()).get(
        getRestaurantDetailEndpoint(sampleRestaurant.id),
      );
      expect(response.status).toBe(200);
      expect(response.body.restaurantName).toBe('newResto');
      expect(response.body.menus[0].dishName).toBe('dish1');
      expect(response.body.menus[1].dishName).toBe('dish2');
    });
  });

  describe('[POST] /restaurant/:id/ (restaurant-detail-create)', () => {
    const getRestaurantDetailEndpoint = (id: number) => `/restaurant/${id}/`;

    it('Return 401 if not logged in', async () => {
      const sendData = {
        dishName: 'newdish',
        price: 5.99,
      };
      const response = await request(app.getHttpServer())
        .post(getRestaurantDetailEndpoint(sampleRestaurant.id))
        .set('Authorization', `Bearer SOMEWRONGTOKENHERE`)
        .send(sendData);
      expect(response.status).toBe(401);
    });

    it('Return 400 if dishName is empty string or not given', async () => {
      const sendData = {
        dishName: '',
        price: 5.99,
      };
      const response = await request(app.getHttpServer())
        .post(getRestaurantDetailEndpoint(sampleRestaurant.id))
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(sendData);
      expect(response.status).toBe(400);
    });

    it('Return 400 if price is not a number', async () => {
      const sendData = {
        dishName: 'newdish',
        price: 'abcd',
      };
      const response = await request(app.getHttpServer())
        .post(getRestaurantDetailEndpoint(sampleRestaurant.id))
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(sendData);
      expect(response.status).toBe(400);
    });

    it('Return 400 if price is negative value', async () => {
      const sendData = {
        dishName: 'newdish',
        price: '-1',
      };
      const response = await request(app.getHttpServer())
        .post(getRestaurantDetailEndpoint(sampleRestaurant.id))
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(sendData);
      expect(response.status).toBe(400);
    });

    it('Return 404 if restaurant id invalid', async () => {
      const sendData = {
        dishName: 'newdish',
        price: 5.99,
      };
      const response = await request(app.getHttpServer())
        .post(getRestaurantDetailEndpoint(999999999)) // arbitrary large invalid id
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(sendData);
      expect(response.status).toBe(404);
    });

    it('Return 403 if you are not the restaurant owner (only owner can create new menu)', async () => {
      const sendData = {
        dishName: 'newdish',
        price: 5.99,
      };
      const response = await request(app.getHttpServer())
        .post(getRestaurantDetailEndpoint(sampleRestaurant.id))
        .set('Authorization', `Bearer ${accessToken2}`)
        .send(sendData);
      expect(response.status).toBe(403);
    });

    it('Return 409 if dishname is duplicated', async () => {
      const sendData = {
        dishName: 'dish1', // dish 1 has already existed earlier
        price: 5.99,
      };
      const response = await request(app.getHttpServer())
        .post(getRestaurantDetailEndpoint(sampleRestaurant.id))
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(sendData);
      expect(response.status).toBe(409);
    });

    it('Return 201 if dish successfully created, make sure fk of the dish is to this resto id', async () => {
      const sendData = {
        dishName: 'newdish',
        price: 5.99,
      };
      const response = await request(app.getHttpServer())
        .post(getRestaurantDetailEndpoint(sampleRestaurant.id))
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(sendData);
      expect(response.status).toBe(201);
      expect(response.body.dishName).toBe('newdish');

      const newMenu = await model.menu.findFirst({
        where: { id: response.body.id },
      });
      expect(newMenu.id).toBe(response.body.id);
      expect(newMenu.dishName).toBe('newdish');
      expect(newMenu.price.toString()).toBe('5.99');
      expect(newMenu.restaurantId).toBe(sampleRestaurant.id);
    });
  });

  describe('[PUT] /menu/:id/ (menu-detail-update)', () => {
    const getMenuDetailEndpoint = (id: number) => `/menu/${id}/`;

    it('Return 401 if not logged in', async () => {
      const sendData = {
        dishName: 'dish1_updated',
        price: 7.99,
      };
      const response = await request(app.getHttpServer())
        .put(getMenuDetailEndpoint(sampleMenu1.id))
        .set('Authorization', `Bearer SOMEWRONGTOKENHERE`)
        .send(sendData);
      expect(response.status).toBe(401);
    });

    it('Return 400 if dishName or price is invalid', async () => {
      // we just test one case here, the rest should follow previous endpoint constraint
      const sendData = {
        dishName: 'dish1_updated',
        price: -7.99,
      };
      const response = await request(app.getHttpServer())
        .put(getMenuDetailEndpoint(sampleMenu1.id))
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(sendData);
      expect(response.status).toBe(400);
    });

    it('Return 404 if menu with this id not found', async () => {
      const sendData = {
        dishName: 'dish1_updated',
        price: 7.99,
      };
      const response = await request(app.getHttpServer())
        .put(getMenuDetailEndpoint(99999999))
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(sendData);
      expect(response.status).toBe(404);
    });

    it('Return 403 if not restaurant owner of the current dish', async () => {
      const sendData = {
        dishName: 'dish1_updated',
        price: 7.99,
      };
      const response = await request(app.getHttpServer())
        .put(getMenuDetailEndpoint(sampleMenu1.id))
        .set('Authorization', `Bearer ${accessToken2}`)
        .send(sendData);
      expect(response.status).toBe(403);
    });

    it('Return 409 if dish name is already taken (no duplicate dishName for same restaurant)', async () => {
      const sendData = {
        dishName: 'dish2', // this dish name already exist
        price: 7.99,
      };
      const response = await request(app.getHttpServer())
        .put(getMenuDetailEndpoint(sampleMenu1.id))
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(sendData);
      expect(response.status).toBe(409);
    });

    it('Return 200 if success, make sure changes reflected in database', async () => {
      const sendData = {
        dishName: 'dish1update',
        price: 7.99,
      };
      const response = await request(app.getHttpServer())
        .put(getMenuDetailEndpoint(sampleMenu1.id))
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(sendData);
      expect(response.status).toBe(200);

      expect(response.body.dishName).toBe('dish1update');
      expect(response.body.price.toString()).toBe('7.99');
      const updatedMenu = await model.menu.findFirst({
        where: { id: response.body.id },
      });
      expect(updatedMenu.dishName).toBe('dish1update');
      expect(updatedMenu.price.toString()).toBe('7.99');
    });
  });

  describe('[DELETE] /menu/:id/ (menu-detail-delete)', () => {
    const getMenuDetailEndpoint = (id: number) => `/menu/${id}/`;

    it('Return 401 if not logged in', async () => {
      const response = await request(app.getHttpServer())
        .delete(getMenuDetailEndpoint(sampleMenu2.id))
        .set('Authorization', `Bearer SOMEWRONGTOKENHERE`);
      expect(response.status).toBe(401);
    });

    it('Return 404 if menu with this id not found', async () => {
      const response = await request(app.getHttpServer())
        .delete(getMenuDetailEndpoint(9999999))
        .set('Authorization', `Bearer ${accessToken1}`);
      expect(response.status).toBe(404);
    });

    it('Return 403 if not restaurant owner of the current dish', async () => {
      const response = await request(app.getHttpServer())
        .delete(getMenuDetailEndpoint(sampleMenu2.id))
        .set('Authorization', `Bearer ${accessToken2}`);
      expect(response.status).toBe(403);
    });

    it('Return 204 if success, make sure dish is deleted', async () => {
      const response = await request(app.getHttpServer())
        .delete(getMenuDetailEndpoint(sampleMenu2.id))
        .set('Authorization', `Bearer ${accessToken1}`);
      expect(response.status).toBe(204);

      const menu = await model.menu.findFirst({
        where: { id: sampleMenu2.id },
      });
      expect(menu).toBeNull();
    });
  });

  describe('[PUT] /restaurant/:id/ (restaurant-detail-update)', () => {
    const getRestaurantDetailEndpoint = (id: number) => `/restaurant/${id}/`;

    it('Return 401 if not logged in', async () => {
      const sendData = {
        openingHours:
          '11:00/21:00/10:00/21:00/09:45/18:45/00:00/00:00/09:45/18:45/11:00/23:30/10:15/19:45',
        restaurantName: 'newRestoUpdated',
      };
      const response = await request(app.getHttpServer())
        .put(getRestaurantDetailEndpoint(sampleRestaurant.id))
        .set('Authorization', `Bearer SOMEWRONGTOKENHERE`)
        .send(sendData);
      expect(response.status).toBe(401);
    });

    it('Return 400 if restaurantName not given or empty string', async () => {
      const sendData = {
        openingHours:
          '11:00/21:00/10:00/21:00/09:45/18:45/00:00/00:00/09:45/18:45/11:00/23:30/10:15/19:45',
      };
      const response = await request(app.getHttpServer())
        .put(getRestaurantDetailEndpoint(sampleRestaurant.id))
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(sendData);
      expect(response.status).toBe(400);
    });

    it('Return 400 if openingHours is not given (detailed checking for constraint seperated on unittest)', async () => {
      const sendData = {
        restaurantName: 'newRestoUpdated',
      };
      const response = await request(app.getHttpServer())
        .put(getRestaurantDetailEndpoint(sampleRestaurant.id))
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(sendData);
      expect(response.status).toBe(400);
    });

    it('Return 404 if restaurant id invalid', async () => {
      const sendData = {
        openingHours:
          '11:00/21:00/10:00/21:00/09:45/18:45/00:00/00:00/09:45/18:45/11:00/23:30/10:15/19:45',
        restaurantName: 'newRestoUpdated',
      };
      const response = await request(app.getHttpServer())
        .put(getRestaurantDetailEndpoint(9999999))
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(sendData);
      expect(response.status).toBe(404);
    });

    it('Return 403 if you are not the restaurant owner (only owner can update restaurant details)', async () => {
      const sendData = {
        openingHours:
          '11:00/21:00/10:00/21:00/09:45/18:45/00:00/00:00/09:45/18:45/11:00/23:30/10:15/19:45',
        restaurantName: 'newRestoUpdated',
      };
      const response = await request(app.getHttpServer())
        .put(getRestaurantDetailEndpoint(sampleRestaurant.id))
        .set('Authorization', `Bearer ${accessToken2}`)
        .send(sendData);
      expect(response.status).toBe(403);
    });

    it('Return 200 if update successful', async () => {
      const sendData = {
        openingHours:
          '11:00/21:00/10:00/21:00/09:45/18:45/00:00/00:00/09:45/18:45/11:00/23:30/10:15/19:45',
        restaurantName: 'newRestoUpdated',
      };
      const response = await request(app.getHttpServer())
        .put(getRestaurantDetailEndpoint(sampleRestaurant.id))
        .set('Authorization', `Bearer ${accessToken1}`)
        .send(sendData);
      expect(response.status).toBe(200);
      expect(response.body.restaurantName).toBe('newRestoUpdated');

      const updatedResto = await model.restaurant.findFirst({
        where: { id: response.body.id },
      });
      expect(updatedResto.id).toBe(response.body.id);
      expect(updatedResto.restaurantName).toBe('newRestoUpdated');
      expect(updatedResto.openingHours).toBe(
        '11:00/21:00/10:00/21:00/09:45/18:45/00:00/00:00/09:45/18:45/11:00/23:30/10:15/19:45',
      );
    });
  });

  describe('[DELETE] /restaurant/:id/ (restaurant-detail-delete)', () => {
    const getRestaurantDetailEndpoint = (id: number) => `/restaurant/${id}/`;

    it('Return 401 if not logged in', async () => {
      const response = await request(app.getHttpServer())
        .delete(getRestaurantDetailEndpoint(sampleRestaurant.id))
        .set('Authorization', `Bearer SOMEWRONGTOKENHERE`);
      expect(response.status).toBe(401);
    });

    it('Return 404 if invalid restaurant id', async () => {
      const response = await request(app.getHttpServer())
        .delete(getRestaurantDetailEndpoint(99999999))
        .set('Authorization', `Bearer ${accessToken1}`);
      expect(response.status).toBe(404);
    });

    it('Return 403 if not restaurant owner', async () => {
      const response = await request(app.getHttpServer())
        .delete(getRestaurantDetailEndpoint(sampleRestaurant.id))
        .set('Authorization', `Bearer ${accessToken2}`); // not owner
      expect(response.status).toBe(403);
    });

    it('Return 204 if delete successful, make sure it is deleted including menus on it', async () => {
      // initially, restaurant still exist, menu in that restaurant also exist
      const restaurantInitial = await model.restaurant.findFirst({
        where: { id: sampleRestaurant.id },
      });
      expect(restaurantInitial).toBeDefined();
      const menuInitial = await model.menu.findFirst({
        where: { id: sampleMenu1.id },
      });
      expect(menuInitial).toBeDefined();
      expect(menuInitial.restaurantId).toBe(restaurantInitial.id);

      // perform deletion
      const response = await request(app.getHttpServer())
        .delete(getRestaurantDetailEndpoint(sampleRestaurant.id))
        .set('Authorization', `Bearer ${accessToken1}`);
      expect(response.status).toBe(204);

      // make sure restaurant it is really deleted
      const restaurant = await model.restaurant.findFirst({
        where: { id: sampleRestaurant.id },
      });
      expect(restaurant).toBeNull();

      // confirm that menu with foreign key to this restaurant is also deleted
      const menu = await model.menu.findFirst({
        where: { id: sampleMenu1.id },
      });
      expect(menu).toBeNull();
    });
  });
});
