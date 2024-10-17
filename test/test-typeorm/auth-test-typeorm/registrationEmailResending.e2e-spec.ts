import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { applyAppSettings } from '../../../src/settings/apply-app-settings';
import request from 'supertest';
import { EmailSendService } from '../../../src/common/service/email-send-service';
import { MockEmailSendService } from '../../../src/common/service/mock-email-send-service';

describe('tests for andpoint auth/registration-email-resending', () => {
  const login1 = 'login11';

  const password1 = 'passwor11';

  const email1 = 'avelminsk11@mail.ru';

  let app;

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
  });

  it('registration-email-resending', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({
        email: email1,
      })
      .expect(204);
  });
});
