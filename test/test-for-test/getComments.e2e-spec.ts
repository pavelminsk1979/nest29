import { DataSource } from 'typeorm';
import cookieParser from 'cookie-parser';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { EmailSendService } from '../../src/common/service/email-send-service';
import { MockEmailSendService } from '../../src/common/service/mock-email-send-service';
import { applyAppSettings } from '../../src/settings/apply-app-settings';
import request from 'supertest';

describe('tests for andpoint auth/logout', () => {
  const loginPasswordBasic64 = 'YWRtaW46cXdlcnR5';

  const login1 = 'login47';

  const password1 = 'passwor47';

  const email1 = 'avelminsk47@mail.ru';

  let app;

  let code;

  let accessToken;

  let userId;

  let blogId1;

  let idPost1;

  let idPost2;

  let commentsId1;

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

    blogId1 = res.body.id;

    //console.log(res.body);
  });

  it('create   post1', async () => {
    const res = await request(app.getHttpServer())
      .post(`/blogger/blogs/${blogId1}/posts`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'title11',
        shortDescription: 'shortDescription11',
        content: 'content-content-content-content',
      })
      .expect(201);

    idPost1 = res.body.id;

    //console.log(res.body);
  });

  it('create comment for post1 ', async () => {
    const res = await request(app.getHttpServer())
      .post(`/posts/${idPost1}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'content2 for post content2 for post content2 for post',
      })
      .expect(201);

    //console.log(res.body);

    commentsId1 = res.body.id;
  });

  /*  it('create post for  blog', async () => {
      const res = await request(app.getHttpServer())
        .post(`/sa/blogs/${blogId}/posts`)
        .set('Authorization', `Basic ${loginPasswordBasic64}`)
        .send({
          title: 'saTitlePost1',
          shortDescription: 'saShortDescriptionPost1',
          content: 'saContentPost1',
        })
        .expect(201);
  
      idPost = res.body.id;
  
      //console.log(res.body);
    });*/

  /*  it('create post2 for  blog', async () => {
      const res = await request(app.getHttpServer())
        .post(`/sa/blogs/${blogId}/posts`)
        .set('Authorization', `Basic ${loginPasswordBasic64}`)
        .send({
          title: 'saTitlePost2',
          shortDescription: 'saShortDescriptionPost2',
          content: 'saContentPost2',
        })
        .expect(201);
  
      idPost2 = res.body.id;
  
      //console.log(res.body);
    });*/

  /*  it('create comment for post ', async () => {
      const res = await request(app.getHttpServer())
        .post(`/posts/${idPost}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'content for post content for post content for post',
        })
        .expect(201);
      //console.log(res.body);
    });*/

  /*  it('create comment2 for post ', async () => {
      const res = await request(app.getHttpServer())
        .post(`/posts/${idPost}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'content2 for post content for post content for post',
        })
        .expect(201);
      //console.log(res.body);
    });*/

  /*  it('create comment3 for post ', async () => {
      const res = await request(app.getHttpServer())
        .post(`/posts/${idPost}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'content3 for post content for post content for post',
        })
        .expect(201);
      //console.log(res.body);
    });*/

  /*  it('create comment4 for post ', async () => {
      const res = await request(app.getHttpServer())
        .post(`/posts/${idPost}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'content4 for post content for post content for post',
        })
        .expect(201);
      //console.log(res.body);
    });*/

  /*  it('create comment5 for post ', async () => {
      const res = await request(app.getHttpServer())
        .post(`/posts/${idPost}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'content5 for post content for post content for post',
        })
        .expect(201);
      //console.log(res.body);
    });*/

  /*  it('create comment6 for post ', async () => {
      const res = await request(app.getHttpServer())
        .post(`/posts/${idPost}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'content6 for post content for post content for post',
        })
        .expect(201);
      //console.log(res.body);
    });*/

  /*  it('create comment7 for post ', async () => {
      const res = await request(app.getHttpServer())
        .post(`/posts/${idPost}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'content7 for post content for post content for post',
        })
        .expect(201);
      //console.log(res.body);
    });*/

  /*  it('create comment8 for post ', async () => {
      const res = await request(app.getHttpServer())
        .post(`/posts/${idPost}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'content8 for post content for post content for post',
        })
        .expect(201);
      //console.log(res.body);
    });*/

  /*  it('create comment9 for post ', async () => {
      const res = await request(app.getHttpServer())
        .post(`/posts/${idPost}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'content9 for post content for post content for post',
        })
        .expect(201);
      //console.log(res.body);
    });*/

  /*  it('create comment10 for post ', async () => {
      const res = await request(app.getHttpServer())
        .post(`/posts/${idPost}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'content10 for post content for post content for post',
        })
        .expect(201);
      //console.log(res.body);
    });*/

  /*  it('create comment11 for post ', async () => {
      const res = await request(app.getHttpServer())
        .post(`/posts/${idPost}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'content11 for post content for post content for post',
        })
        .expect(201);
      //console.log(res.body);
    });*/

  /*  it('create comment12 for post ', async () => {
      const res = await request(app.getHttpServer())
        .post(`/posts/${idPost}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'content12 for post content for post content for post',
        })
        .expect(201);
      //console.log(res.body);
    });*/

  /*  it('create comment22 for post ', async () => {
      const res = await request(app.getHttpServer())
        .post(`/posts/${idPost2}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'content22 for post content for post content for post',
        })
        .expect(201);
      //console.log(res.body);
    });*/

  it('get all comments', async () => {
    const res = await request(app.getHttpServer())
      .get('/blogger/blogs/comments')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    console.log(res.body);
  });
});
