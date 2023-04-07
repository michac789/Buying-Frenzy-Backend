import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from './app.module';
import { ModelService } from './model/model.service';
import * as argon from 'argon2';
import * as request from 'supertest';

describe('App SSO e2e', () => {
  let app: INestApplication;
  let model: ModelService;

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
    await app.listen(3333);

    model = app.get(ModelService);
    await model.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => app.close());

  describe('sso', () => {
    describe('register', () => {
      const registerEndpoint = '/sso/register/';

      it('Return 400 if name is empty string', async () => {
        const sendData = {
          name: '',
          password: '123',
          email: 'mich0107@e.ntu.edu.sg',
        };
        const response = await request(app.getHttpServer())
          .post(registerEndpoint)
          .send(sendData);
        expect(response.status).toBe(400);
      });

      it('Return 400 if name is not given', async () => {
        const sendData = {
          password: '123',
          email: 'mich0107@e.ntu.edu.sg',
        };
        const response = await request(app.getHttpServer())
          .post(registerEndpoint)
          .send(sendData);
        expect(response.status).toBe(400);
      });

      it('Return 400 if password is empty string', async () => {
        const sendData = {
          name: 'michael',
          password: '',
        };
        const response = await request(app.getHttpServer())
          .post(registerEndpoint)
          .send(sendData);
        expect(response.status).toBe(400);
      });

      it('Return 400 if password is not given', async () => {
        const sendData = {
          name: 'michael',
        };
        const response = await request(app.getHttpServer())
          .post(registerEndpoint)
          .send(sendData);
        expect(response.status).toBe(400);
      });

      it('Return 400 if email is given but not an email', async () => {
        const sendData = {
          name: 'michael',
          password: '123',
          email: 'mich0107',
        };
        const response = await request(app.getHttpServer())
          .post(registerEndpoint)
          .send(sendData);
        expect(response.status).toBe(400);
      });

      it('Return 409 if duplicate name given', async () => {
        await model.user.create({
          data: {
            cashBalance: 0,
            name: 'michael',
            password: await argon.hash('123'),
          },
        });
        const sendData = {
          name: 'michael',
          password: '123',
          email: 'mich0107@e.ntu.edu.sg',
        };
        const response = await request(app.getHttpServer())
          .post(registerEndpoint)
          .send(sendData);
        expect(response.status).toBe(409);
      });

      it('Return 201 if created, cashBalance initialized to zero, save hashed password, return access token', async () => {
        const sendData = {
          name: 'michael andrew chan',
          password: '123',
          email: 'mich0107@e.ntu.edu.sg',
        };
        const response = await request(app.getHttpServer())
          .post(registerEndpoint)
          .send(sendData);
        expect(response.status).toBe(201);
        // should return access token and be logged in directly
        expect(response.body).toHaveProperty('access_token');
        // verify that the instance is indeed created in the database
        const createdUser = await model.user.findUnique({
          where: { name: sendData.name },
        });
        expect(createdUser.name).toBe('michael andrew chan');
        expect(createdUser.cashBalance.toString()).toBe('0');
        expect(createdUser.email).toBe('mich0107@e.ntu.edu.sg');
        // verify that it store hashed password and not raw pw
        // we cannot verify same when hashing due to random salt given
        expect(createdUser.password).not.toBe('123');
        expect(createdUser.password.length).toBeGreaterThan(20);
      });
    });

    describe('login', () => {
      const registerEndpoint = '/sso/login/';

      it('Return 400 if name is empty string', async () => {
        const sendData = {
          name: '',
          password: '123',
        };
        const response = await request(app.getHttpServer())
          .post(registerEndpoint)
          .send(sendData);
        expect(response.status).toBe(400);
      });

      it('Return 400 if name is not given', async () => {
        const sendData = {
          password: '123',
          email: 'mich0107@e.ntu.edu.sg',
        };
        const response = await request(app.getHttpServer())
          .post(registerEndpoint)
          .send(sendData);
        expect(response.status).toBe(400);
      });

      it('Return 400 if password is empty string', async () => {
        const sendData = {
          name: 'michael',
          password: '',
        };
        const response = await request(app.getHttpServer())
          .post(registerEndpoint)
          .send(sendData);
        expect(response.status).toBe(400);
      });

      it('Return 400 if password is not given', async () => {
        const sendData = {
          name: 'michael',
        };
        const response = await request(app.getHttpServer())
          .post(registerEndpoint)
          .send(sendData);
        expect(response.status).toBe(400);
      });

      it('Return 400 if email is given but not an email', async () => {
        const sendData = {
          name: 'michael',
          password: '123',
          email: 'mich0107',
        };
        const response = await request(app.getHttpServer())
          .post(registerEndpoint)
          .send(sendData);
        expect(response.status).toBe(400);
      });

      it('Return 401 if name is invalid', async () => {
        const sendData = {
          name: 'asfihjafshf',
          password: '123',
        };
        const response = await request(app.getHttpServer())
          .post(registerEndpoint)
          .send(sendData);
        expect(response.status).toBe(401);
      });

      it('Return 401 if password does not match', async () => {
        const sendData = {
          name: 'michael',
          password: '1234',
        };
        const response = await request(app.getHttpServer())
          .post(registerEndpoint)
          .send(sendData);
        expect(response.status).toBe(401);
      });

      it('Return 200 and get access code when success', async () => {
        const sendData = {
          name: 'michael',
          password: '123',
        };
        const response = await request(app.getHttpServer())
          .post(registerEndpoint)
          .send(sendData);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('access_token');
      });
    });
  });
});
