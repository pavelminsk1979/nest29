import { DataSource } from 'typeorm';
import cookieParser from 'cookie-parser';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { EmailSendService } from '../../src/common/service/email-send-service';
import { MockEmailSendService } from '../../src/common/service/mock-email-send-service';
import { applyAppSettings } from '../../src/settings/apply-app-settings';
import request from 'supertest';

describe('tests for andpoint auth/logout', () => {
  const login1 = 'login7';

  const password1 = 'passwor7';

  const email1 = 'avelminsk7@mail.ru';

  let app;

  let code;

  let blogId;
  let blogId2;
  let blogId3;

  let accessToken;

  let postId;

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

  it(' login  user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: login1,
        password: password1,
      })
      .expect(200);

    accessToken = res.body.accessToken;
    //console.log(accessToken);
  });

  it('blogger create blog', async () => {
    const res = await request(app.getHttpServer())
      .post('/blogger/blogs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'name1',
        description: 'description1',
        websiteUrl: 'https://www.outue1.com/',
      })

      .expect(201);
    blogId = res.body.id;
    //console.log(res.body);
  });

  it('create   blog3 without user', async () => {
    const res = await request(app.getHttpServer())
      .post('/blogs')
      .send({
        name: 'name4',
        description: 'description4',
        websiteUrl: 'https://www.outue4.com/',
      })
      .expect(201);

    //console.log(res.body);
  });

  it('get all blogs', async () => {
    const res = await request(app.getHttpServer())
      .get('/blogger/blogs')
      .set('Authorization', `Bearer ${accessToken}`)

      .expect(200);

    //console.log(res.body);
  });

  it('update blog', async () => {
    const res = await request(app.getHttpServer())
      .put(`/blogger/blogs/${blogId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'name123',
        description: 'description123',
        websiteUrl: 'https://www.outue123.com/',
      })

      .expect(204);

    //console.log(res.body);
  });

  it('delete blog', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/blogger/blogs/${blogId}`)
      .set('Authorization', `Bearer ${accessToken}`)

      .expect(204);

    //console.log(res.body);
  });

  it('blogger create blog2', async () => {
    const res = await request(app.getHttpServer())
      .post('/blogger/blogs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'name2',
        description: 'description2',
        websiteUrl: 'https://www.outue2.com/',
      })

      .expect(201);
    blogId2 = res.body.id;
    //console.log(res.body);
  });

  it('blogger create post for blog2', async () => {
    const res = await request(app.getHttpServer())
      .post(`/blogger/blogs/${blogId2}/posts`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'title',
        shortDescription: 'shortDescription',
        content: 'content#content#content',
      })

      .expect(201);
    //console.log(res.body);
    postId = res.body.id;
  });

  it('get all posts for correct blog', async () => {
    const res = await request(app.getHttpServer())
      .get(`/blogger/blogs/${blogId2}/posts`)
      .set('Authorization', `Bearer ${accessToken}`)

      .expect(200);

    //console.log(res.body);
  });

  it('update post for correct blog', async () => {
    const res = await request(app.getHttpServer())
      .put(`/blogger/blogs/${blogId2}/posts/${postId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'titleUpdate',
        shortDescription: 'shortDescriptionUpdate',
        content: 'content#content#contentUpdate',
      })

      .expect(204);

    //console.log(res.body);
  });

  it('delete post for correct blog', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/blogger/blogs/${blogId2}/posts/${postId}`)
      .set('Authorization', `Bearer ${accessToken}`)

      .expect(204);

    //console.log(res.body);
  });

  it('create   blog3 without user', async () => {
    const res = await request(app.getHttpServer())
      .post('/blogs')
      .send({
        name: 'name3',
        description: 'description3',
        websiteUrl: 'https://www.outue3.com/',
      })
      .expect(201);

    blogId3 = res.body.id;

    //console.log(res.body);
  });
});
