import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { applyAppSettings } from '../../../src/settings/apply-app-settings';
import request from 'supertest';
import { EmailSendService } from '../../../src/common/service/email-send-service';
import { MockEmailSendService } from '../../../src/common/service/mock-email-send-service';
import { DataSource } from 'typeorm';
import cookieParser from 'cookie-parser';

/*ТЕСТ НА получение нового
АКЦЕСТОКЕНА и РЕФРЕШТОКЕНА
-РЕГИСТРАЦИЯ
-ПОДТВЕРЖДЕНИЕ РЕГИСТРАЦИИ
-ЛОГИНИЗАЦИЯ
 возму РЕФРЕШТОКЕН 
 и с ним обращусь на эндпоинт refresh-token
   и получу новую пару токенов (рефреш и аксес)
  */

describe('tests for andpoint auth/login', () => {
  const login1 = 'login377';

  const password1 = 'passwor377';

  const email1 = 'avelminsk377@mail.ru';

  let app;

  let code;

  let refreshToken;

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
    /*    если я положу  refreshToken в куку -вот так
  response.cookie('refreshToken', result.refreshToken, {
 httpOnly: true,
 secure: true,
});
 ......это значит он в заголовках

 свойство res.headers['set-cookie'] содержит
 массив строк, представляющих заголовки 'Set-Cookie',
   включая куку 'refreshToken'.*/
    const allCookies = res.headers['set-cookie'];

    const refrToken = allCookies[0].split(';')[0];

    refreshToken = refrToken.split('=')[1];
  });

  it('refresh-token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/refresh-token')
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(200);
    const allCookies = res.headers['set-cookie'];

    const refrToken = allCookies[0].split(';')[0];

    const newRefreshToken = refrToken.split('=')[1];

    const accessToken = res.body.accessToken;

    console.log(']]]]]]]]]');
    console.log(newRefreshToken);
    console.log(accessToken);
    console.log('[[[[[[[[[[[[');
  });
});
