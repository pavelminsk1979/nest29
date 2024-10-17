import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { applyAppSettings } from '../../src/settings/apply-app-settings';
import request from 'supertest';

/*ТАБЛИЦА typeOrmDataBase*/
describe('tests for andpoint blog', () => {
  let app;

  let idBlog2;

  let idBlog1;

  let idBlogForUpdate;

  let idPost1;

  const loginPasswordBasic64 = 'YWRtaW46cXdlcnR5';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    applyAppSettings(app);

    await app.init();

    //для очистки базы данных
    await request(app.getHttpServer()).delete('/testing/all-data');
  });

  afterAll(async () => {
    await app.close();
  });

  it('create   blog1', async () => {
    const res = await request(app.getHttpServer())
      .post('/sa/blogs')
      .set('Authorization', `Basic ${loginPasswordBasic64}`)
      .send({
        name: 'nameSA11',
        description: 'descriptionSA11',
        websiteUrl: 'https://www.outueSA11.com/',
      })
      .expect(201);

    idBlog1 = res.body.id;

    //console.log(res.body);
  });

  it('create   blog2', async () => {
    const res = await request(app.getHttpServer())
      .post('/sa/blogs')
      .set('Authorization', `Basic ${loginPasswordBasic64}`)
      .send({
        name: 'nameSA12',
        description: 'descriptionSA12',
        websiteUrl: 'https://www.outueSA12.com/',
      })
      .expect(201);

    /* console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
     console.log(res.body);*/

    idBlog2 = res.body.id;
  });

  it('create   blog3', async () => {
    const res = await request(app.getHttpServer())
      .post('/sa/blogs')
      .set('Authorization', `Basic ${loginPasswordBasic64}`)
      .send({
        name: 'nameSA13',
        description: 'descriptionSA13',
        websiteUrl: 'https://www.outueSA13.com/',
      })
      .expect(201);

    //console.log(res.body);

    idBlogForUpdate = res.body.id;
  });

  it('get all  blogs andpoint blogs', async () => {
    const res = await request(app.getHttpServer())
      .get('/sa/blogs')
      .set('Authorization', `Basic ${loginPasswordBasic64}`)

      .expect(200);
    //console.log(res.body);
  });

  it('update   blog by id', async () => {
    const res = await request(app.getHttpServer())
      .put(`/sa/blogs/${idBlogForUpdate}`)
      .set('Authorization', `Basic ${loginPasswordBasic64}`)
      .send({
        name: 'nameUpdate',
        description: 'descripUpdate',
        websiteUrl: 'https://www.outueUpdate.com/',
      })
      .expect(204);
    //console.log(res.body);
  });
  it('update   blog by id', async () => {
    const badId = '602afe92-7d97-4395-b1b9-6cf98b351bbe';
    const res = await request(app.getHttpServer())
      .put(`/sa/blogs/${badId}`)
      .set('Authorization', `Basic ${loginPasswordBasic64}`)
      .send({
        name: 'nameUpdate',
        description: 'descripUpdate',
        websiteUrl: 'https://www.outueUpdate.com/',
      })
      .expect(404);
    //console.log(res.body);
  });

  it('delete   blog by id', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/sa/blogs/${idBlogForUpdate}`)
      .set('Authorization', `Basic ${loginPasswordBasic64}`)

      .expect(204);
    //console.log(res.body);
  });

  it('delete   blog by id', async () => {
    const badId = '602afe92-7d97-4395-b1b9-6cf98b351bbe';
    const res = await request(app.getHttpServer())
      .delete(`/sa/blogs/${badId}`)
      .set('Authorization', `Basic ${loginPasswordBasic64}`)

      .expect(404);
    //console.log(res.body);
  });

  it('get  blog by id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/blogs/${idBlog1}`)

      .expect(200);
    //console.log(res.body);
  });

  it('create post1 for  blog1', async () => {
    const res = await request(app.getHttpServer())
      .post(`/sa/blogs/${idBlog1}/posts`)
      .set('Authorization', `Basic ${loginPasswordBasic64}`)
      .send({
        title: 'saTitlePost1',
        shortDescription: 'saShortDescriptionPost1',
        content: 'saContentPost1',
      })
      .expect(201);

    idPost1 = res.body.id;

    //console.log(res.body);
  });
  it('create post2 for  blog1', async () => {
    const res = await request(app.getHttpServer())
      .post(`/sa/blogs/${idBlog1}/posts`)
      .set('Authorization', `Basic ${loginPasswordBasic64}`)
      .send({
        title: 'saTitlePost2',
        shortDescription: 'saShortDescriptionPost2',
        content: 'saContentPost2',
      })
      .expect(201);

    //console.log(res.body);
  });

  it('create post1 for  blog2', async () => {
    const res = await request(app.getHttpServer())
      .post(`/sa/blogs/${idBlog2}/posts`)
      .set('Authorization', `Basic ${loginPasswordBasic64}`)
      .send({
        title: 'saTitlePost122',
        shortDescription: 'saShortDescriptionPost122',
        content: 'saContentPost122',
      })
      .expect(201);

    //console.log(res.body);
  });
  it('create post2 for  blog2', async () => {
    const res = await request(app.getHttpServer())
      .post(`/sa/blogs/${idBlog2}/posts`)
      .set('Authorization', `Basic ${loginPasswordBasic64}`)
      .send({
        title: 'saTitlePost222',
        shortDescription: 'saShortDescriptionPost222',
        content: 'saContentPost222',
      })
      .expect(201);

    //console.log(res.body);
  });

  it('get  all posts for blog1 ', async () => {
    const res = await request(app.getHttpServer())
      .get(`/sa/blogs/${idBlog1}/posts`)
      .set('Authorization', `Basic ${loginPasswordBasic64}`)
      .expect(200);
    console.log(res.body);
  });

  it('update   post  by id', async () => {
    const res = await request(app.getHttpServer())
      .put(`/sa/blogs/${idBlog1}/posts/${idPost1}`)
      .set('Authorization', `Basic ${loginPasswordBasic64}`)
      .send({
        title: 'saTitlePost222Update',
        shortDescription: 'saShortDescriptionPost222Update',
        content: 'saContentPost222Update',
      })
      .expect(204);
    //console.log(res.body);
  });

  it('delete   post by id', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/sa/blogs/${idBlog1}/posts/${idPost1}`)
      .set('Authorization', `Basic ${loginPasswordBasic64}`)

      .expect(204);
    //console.log(res.body);
  });
});
