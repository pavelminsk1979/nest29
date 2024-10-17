import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { applyAppSettings } from '../../../src/settings/apply-app-settings';
import request from 'supertest';
import { EmailSendService } from '../../../src/common/service/email-send-service';
import { MockEmailSendService } from '../../../src/common/service/mock-email-send-service';
import { DataSource } from 'typeorm';

/*ТЕСТ НА
-РЕГИСТРАЦИЯ
-ПОДТВЕРЖДЕНИЕ РЕГИСТРАЦИИ
-ЛОГИНИЗАЦИЯ
(в базе появится сущность в таблице usertyp и 
также после логинизации появится сущность
в таблице securityDevice)*/

describe('tests for andpoint auth/login', () => {
  const login1 = 'login33';

  const password1 = 'passwor33';

  const email1 = 'avelminsk33@mail.ru';

  let app;

  let code;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailSendService)
      .useValue(new MockEmailSendService())

      .compile();

    app = moduleFixture.createNestApplication();

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
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: login1,
        password: password1,
      })
      .expect(200);
  });
});
