import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { applyAppSettings } from '../../../src/settings/apply-app-settings';
import request from 'supertest';
import { EmailSendService } from '../../../src/common/service/email-send-service';
import { MockEmailSendService } from '../../../src/common/service/mock-email-send-service';
import { DataSource } from 'typeorm';
import cookieParser from 'cookie-parser';

/*ТЕСТ НА me запрос
-РЕГИСТРАЦИЯ
-ПОДТВЕРЖДЕНИЕ РЕГИСТРАЦИИ
-ЛОГИНИЗАЦИЯ и из ответа логинизации
беру accessToken 

-- и эндпоинт me  он защищенный и 
надо предоставить   
.set('Authorization', `Bearer ${accessToken}`)

 и будет  дан ответ - данные usera 
*/

describe('tests for andpoint auth/logout', () => {
  const login1 = 'login47';

  const password1 = 'passwor47';

  const email1 = 'avelminsk47@mail.ru';

  let app;

  let code;

  let accessToken;

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

  it('registration  user', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        login: login1,
        password: password1,
        email: email1,
      })
      .expect(204);

    const dataSource = await app.resolve(DataSource);

    const result = await dataSource.query(
      `
        select *
    from public."usertyp" u
    where u.login = login
        `,
    );
    code = result[0].confirmationCode;

    //console.log(code);
  });

  it('registration-confirmation  user', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({ code })
      .expect(204);
  });

  it('creat user and login  user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: login1,
        password: password1,
      })
      .expect(200);

    accessToken = res.body.accessToken;
  });

  it('me request', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    /*  console.log('------------');
      console.log(res.body);
      console.log('-----------');*/
  });

  it('me request', async () => {
    const badAccessToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxZWIyNDdlYi00NmMwLTQ5NGMtYjFmMC03Y2E2ZTM2MmZlNDkiLCJpYXQiOjE3MjMxNTQzMTksImV4cCI6MTcyMzE1NDYxOX0.rIhexOrtt8haTw8Je_0wbwXMNCo00Mov5fuHAb1fAVA';
    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${badAccessToken}`)
      .expect(401);

    /*  console.log('------------');
      console.log(res.body);
      console.log('-----------');*/
  });
});
