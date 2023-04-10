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

    // populate sample restaurant and menu
    // restaurant
    await 
  });

  afterAll(async () => await model.cleanDb());

    // describe('[POST] /restaurant/ (restaurant-create)', () => {
  //   const restaurantCreateEndpoint = '/restaurant/';

  //   it('Return 401 if not logged in', async () => {
  //     const sendData = {
  //       openingHours:
  //         '10:00/21:00/10:00/21:00/09:45/18:45/00:00/00:00/09:45/18:45/11:00/23:30/10:15/19:45',
  //       restaurantName: 'newResto',
  //     };
  //     sampleUser1;
  //     const response = await request(app.getHttpServer())
  //       .post(restaurantCreateEndpoint)
  //       .send(sendData);
  //     expect(response.status).toBe(401);
  //   });
  // });
});
