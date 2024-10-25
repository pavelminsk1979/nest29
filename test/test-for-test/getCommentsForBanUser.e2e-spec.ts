import cookieParser from 'cookie-parser';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { applyAppSettings } from '../../src/settings/apply-app-settings';
import request from 'supertest';
import { DataSource } from 'typeorm';

describe('tests for andpoint auth/logout', () => {
  const loginPasswordBasic64 = 'YWRtaW46cXdlcnR5';

  const login1 = 'login47';

  const password1 = 'passwor47';

  const email1 = 'avelminsk47@mail.ru';

  const login2 = 'login2';

  const password2 = 'passwor2';

  const email2 = 'avelminsk2@mail.ru';

  let app;

  let userId;
  let userId2;

  let code;

  let accessToken;
  let accessToken2;

  let blogId;
  let blogId2;

  let idPost;

  let commentsId;

  let idPost2;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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
    await request(app.getHttpServer())
      .post('/sa/users')
      .set('Authorization', `Basic ${loginPasswordBasic64}`)
      .send({
        login: login1,
        password: password1,
        email: email1,
      })
      .expect(201);

    const dataSource = await app.resolve(DataSource);

    const result = await dataSource.query(
      `
          select *
      from public."usertyp" u
      where u.login = login
          `,
    );
    // console.log(result[0]);
    userId = result[0].id;
    // console.log(userId);
  });

  it('login  user', async () => {
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

  it('create   blog1', async () => {
    const res = await request(app.getHttpServer())
      .post('/blogger/blogs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'name11',
        description: 'description11',
        websiteUrl: 'https://www.outue11.com/',
      })
      .expect(201);

    blogId = res.body.id;

    //console.log(res.body);
  });

  it('create user2', async () => {
    await request(app.getHttpServer())
      .post('/sa/users')
      .set('Authorization', `Basic ${loginPasswordBasic64}`)
      .send({
        login: login2,
        password: password2,
        email: email2,
      })
      .expect(201);

    const dataSource = await app.resolve(DataSource);

    const result = await dataSource.query(
      `
          select *
      from public."usertyp" u
      where u.login = login
          `,
    );
    // console.log(result[0]);
    userId2 = result[1].id;
    // console.log(userId);
  });

  it('login  user2', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: login2,
        password: password2,
      })
      .expect(200);

    accessToken2 = res.body.accessToken;
    //console.log(accessToken);
  });

  it('create   blog2', async () => {
    const res = await request(app.getHttpServer())
      .post('/blogger/blogs')
      .set('Authorization', `Bearer ${accessToken2}`)
      .send({
        name: 'name22',
        description: 'description22',
        websiteUrl: 'https://www.outue22.com/',
      })
      .expect(201);

    blogId2 = res.body.id;

    //console.log(res.body);
  });

  it('ban correct user', async () => {
    await request(app.getHttpServer())
      .put(`/blogger/users/${userId2}/ban`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        isBanned: true,
        banReason: 'very very very bad boy2',
        blogId: blogId,
      })
      .expect(204);
  });

  it('get users', async () => {
    const res = await request(app.getHttpServer())
      .get(`/blogger/users/blog/${blogId}`)
      .set('Authorization', `Bearer ${accessToken}`)

      .expect(200);

    console.log(res.body);
  });
});

/*  it('get users', async () => {
     const res = await request(app.getHttpServer())
       .get('/sa/users')
       .set('Authorization', `Basic ${loginPasswordBasic64}`)

       .expect(200);

     //console.log(res.body);
   });*/

/*  it('create comment for post1 ', async () => {
    const res = await request(app.getHttpServer())
      .post(`/posts/${idPost}/comments`)
      .set('Authorization', `Bearer ${accessToken2}`)
      .send({
        content: 'content2 for post content2 for post content2 for post',
      })
      .expect(201);

    //console.log(res.body);

    commentsId = res.body.id;
  });*/

/*  it('get correct comment', async () => {
    const res = await request(app.getHttpServer())
      .get(`/comments/${commentsId}`)
      .set('Authorization', `Bearer ${accessToken}`)

      .expect(200);

    console.log(res.body);
  });*/

/*  it('get correct comment', async () => {
     const res = await request(app.getHttpServer())
       .get(`/comments/${commentsId}`)
       .set('Authorization', `Bearer ${accessToken}`)

       .expect(404);

     //console.log(res.body);
   });*/

/*  it('create   blog1', async () => {
     const res = await request(app.getHttpServer())
       .post('/blogger/blogs')
       .set('Authorization', `Bearer ${accessToken}`)
       .send({
         name: 'name11',
         description: 'description11',
         websiteUrl: 'https://www.outue11.com/',
       })
       .expect(201);

     blogId = res.body.id;

     //console.log(res.body);
   });*/

/*  it('create   post1', async () => {
    const res = await request(app.getHttpServer())
      .post(`/blogger/blogs/${blogId}/posts`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'title11',
        shortDescription: 'shortDescription11',
        content: 'content-content-content-content',
      })
      .expect(201);

    idPost = res.body.id;

    //console.log(res.body);
  });*/

/*

import cookieParser from 'cookie-parser';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { applyAppSettings } from '../../src/settings/apply-app-settings';
import request from 'supertest';
import { DataSource } from 'typeorm';

describe('tests for andpoint auth/logout', () => {
  const loginPasswordBasic64 = 'YWRtaW46cXdlcnR5';

  const login1 = 'login47';

  const password1 = 'passwor47';

  const email1 = 'avelminsk47@mail.ru';

  let app;

  let userId;

  let code;

  let accessToken;

  let blogId;

  let idPost;

  let commentsId;

  let idPost2;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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
    await request(app.getHttpServer())
      .post('/sa/users')
      .set('Authorization', `Basic ${loginPasswordBasic64}`)
      .send({
        login: login1,
        password: password1,
        email: email1,
      })
      .expect(201);

    const dataSource = await app.resolve(DataSource);

    const result = await dataSource.query(
      `
          select *
      from public."usertyp" u
      where u.login = login
          `,
    );
    // console.log(result[0]);
    userId = result[0].id;
    // console.log(userId);
  });

  it('login  user', async () => {
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

  it('create   blog1', async () => {
    const res = await request(app.getHttpServer())
      .post('/blogger/blogs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'name11',
        description: 'description11',
        websiteUrl: 'https://www.outue11.com/',
      })
      .expect(201);

    blogId = res.body.id;

    //console.log(res.body);
  });

  it('create   post1', async () => {
    const res = await request(app.getHttpServer())
      .post(`/blogger/blogs/${blogId}/posts`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'title11',
        shortDescription: 'shortDescription11',
        content: 'content-content-content-content',
      })
      .expect(201);

    idPost = res.body.id;

    //console.log(res.body);
  });

  it('create comment for post1 ', async () => {
    const res = await request(app.getHttpServer())
      .post(`/posts/${idPost}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'content for post content for post content for post',
      })
      .expect(201);

    //console.log(res.body);

    commentsId = res.body.id;
  });

  it('get correct comment', async () => {
    const res = await request(app.getHttpServer())
      .get(`/comments/${commentsId}`)
      .set('Authorization', `Bearer ${accessToken}`)

      .expect(200);
    /!* console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
     console.log(res.body);
     console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');*!/
  });

  it('ban correct user', async () => {
    await request(app.getHttpServer())
      .put(`/sa/users/${userId}/ban`)
      .set('Authorization', `Basic ${loginPasswordBasic64}`)
      .send({
        isBanned: true,
        banReason: 'very very very bad boy',
      })
      .expect(204);
  });

  it('get correct comment', async () => {
    const res = await request(app.getHttpServer())
      .get(`/comments/${commentsId}`)
      .set('Authorization', `Bearer ${accessToken}`)

      .expect(404);
  });
});
*/
