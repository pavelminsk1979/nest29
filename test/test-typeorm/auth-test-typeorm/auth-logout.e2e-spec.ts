import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { applyAppSettings } from '../../../src/settings/apply-app-settings';
import request from 'supertest';
import { EmailSendService } from '../../../src/common/service/email-send-service';
import { MockEmailSendService } from '../../../src/common/service/mock-email-send-service';
import { DataSource } from 'typeorm';
import cookieParser from 'cookie-parser';

/*ТЕСТ НА ВЫЛОГИНИВАНИЕ
-РЕГИСТРАЦИЯ
-ПОДТВЕРЖДЕНИЕ РЕГИСТРАЦИИ
-ЛОГИНИЗАЦИЯ и из ответа логинизации
беру refreshToken  

-- и эндпоинт logout  он защищенный и 
надо предоставить refreshToken  чтобы 
вылогинится
 и будет  удалена  одну запись - один девайс
  из таблицы Securitydevicetyp
*/

describe('tests for andpoint auth/logout', () => {
  const login1 = 'login40';

  const password1 = 'passwor40';

  const email1 = 'avelminsk40@mail.ru';

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

  /*  it('logout', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(204);
    });*/

  it('logout', async () => {
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(204);
  });
});
