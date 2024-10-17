import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { applyAppSettings } from '../../../src/settings/apply-app-settings';
import request from 'supertest';
import { EmailSendService } from '../../../src/common/service/email-send-service';
import { MockEmailSendService } from '../../../src/common/service/mock-email-send-service';
import cookieParser from 'cookie-parser';

describe('tests for andpoint users', () => {
  const login1 = 'login400';

  const password1 = 'passwor400';

  const email1 = 'avelminsk400@mail.ru';

  const login2 = 'login401';

  const password2 = 'passwor401';

  const email2 = 'avelminsk401@mail.ru';

  let app;

  const loginPasswordBasic64 = 'YWRtaW46cXdlcnR5';

  let userId;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailSendService)
      .useValue(new MockEmailSendService())

      .compile();

    app = moduleFixture.createNestApplication();

    app.use(cookieParser());

    applyAppSettings(app);

    await app.init();

    //для очистки базы данных
    await request(app.getHttpServer()).delete('/testing/all-data');
  });

  afterAll(async () => {
    await app.close();
  });

  it('create user', async () => {
    const res = await request(app.getHttpServer())
      .post('/sa/users')
      .set('Authorization', `Basic ${loginPasswordBasic64}`)
      .send({
        login: login1,
        password: password1,
        email: email1,
      })
      .expect(201);

    userId = res.body.id;

    console.log(res.body);
  });

  it('create user', async () => {
    const res = await request(app.getHttpServer())
      .post('/sa/users')
      .set('Authorization', `Basic ${loginPasswordBasic64}`)
      .send({
        login: login2,
        password: password2,
        email: email2,
      })
      .expect(201);

    //userId = res.body.id;
  });

  /*  it('delete  user by id', async () => {
      await request(app.getHttpServer())
        .delete(`/sa/users/${userId}`)
        .set('Authorization', `Basic ${loginPasswordBasic64}`)
  
        .expect(204);
    });*/

  it('get users', async () => {
    const res = await request(app.getHttpServer())
      .get('/sa/users')
      .set('Authorization', `Basic ${loginPasswordBasic64}`)

      .expect(200);
    console.log(res.body);
  });

  it('delete  user by id', async () => {
    const id = '602afe92-7d97-4395-b1b9-6cf98b351bbe';
    await request(app.getHttpServer())
      .delete(`/sa/users/${id}`)
      .set('Authorization', `Basic ${loginPasswordBasic64}`)

      .expect(404);
  });
});
