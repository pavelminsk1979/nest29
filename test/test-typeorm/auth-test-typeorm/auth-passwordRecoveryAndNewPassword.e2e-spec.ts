import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { applyAppSettings } from '../../../src/settings/apply-app-settings';
import request from 'supertest';
import { EmailSendService } from '../../../src/common/service/email-send-service';
import { MockEmailSendService } from '../../../src/common/service/mock-email-send-service';
import { DataSource } from 'typeorm';

/*



  предварительно должно  регистрация и registration-confirmation

  ТЕСТ НА
  -ЕСЛИ ЗАБЫЛ ПАРОЛЬ -МОЖНО ВОСТАНОВИТЬ
  -эндпоинт password-recovery    ожидает email
  -найдет юзера в базе
  --установит новый КОД и дату протухания этого кода
  -отправит этот КОД на почту И ТУТ РАБОТА ЭНДПОИНТА
  password-recovery  ЗАВЕРШИТСЯ
 НО СЛЕДУЮЩИЙ ЭНДПОИНТ ПРОДОЛЖИТ ДАННУЮ
 ЦЕПОЧКУ ДЕЙСТВИ ПО ИЗМЕНЕНИЯ ПАРОЛЯ ЭТО
 ЭНДПОИНТ new-password
  --- на эндпоинт new-password    отсылается
   КОД  и   НОВЫЙ ПАРОЛЬ
   И далее  сменится passwordHash в базе у Юзера




-РЕГИСТРАЦИЯ
-ПОДТВЕРЖДЕНИЕ РЕГИСТРАЦИИ
(в базе появится сущность в таблице usertyp
у нее есть поле passwordHash   и  значение
из этого поля  должно поменятся после использования
запросов  на эндпоинты
-password-recovery
 -new-password)


*/

describe('tests for andpoint auth/login', () => {
  const login1 = 'login0';

  const password1 = 'passwor0';

  const newPassword = 'newpas0';

  const email1 = 'avelminsk0@mail.ru';

  let app;

  let code;

  let passwordHash;

  let newCode;

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

    passwordHash = result[0].passwordHash;

    console.log(passwordHash);
  });

  it('registration-confirmation  user', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({ code })
      .expect(204);
  });

  it('password-recovery', async () => {
    await request(app.getHttpServer())
      .post('/auth/password-recovery')
      .send({ email: email1 })
      .expect(204);

    const dataSource = await app.resolve(DataSource);

    const result = await dataSource.query(
      `
        select *
    from public."usertyp" u
    where u.login = login
        `,
    );
    newCode = result[0].confirmationCode;
    //КОДЫ ДОЛЖНЫ БЫТЬ РАЗНЫЕ
    /*  console.log('!!!!!!!!!!!!!!!!!!!!');
      console.log('code');
      console.log(code);
      console.log('newCode');
      console.log(newCode);
      console.log('!!!!!!!!!!!!!!!!!!');*/
  });

  it('registration-confirmation  user', async () => {
    await request(app.getHttpServer())
      .post('/auth/new-password')
      .send({ newPassword, recoveryCode: newCode })
      .expect(204);

    const dataSource = await app.resolve(DataSource);

    const result = await dataSource.query(
      `
        select *
    from public."usertyp" u
    where u.login = login
        `,
    );

    const newPasswordHash = result[0].passwordHash;
    //хэши должны быть разные
    /*   console.log('!!!!!!!!!!!!!!!!!!!!');
       console.log(passwordHash);
       console.log(newPasswordHash);
       console.log('!!!!!!!!!!!!!!!!!!');*/
  });
});
