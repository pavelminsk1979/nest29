import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Blogtyp } from '../../blogs/domains/blogtyp.entity';

@Entity()
/*не создает таблицы без
TypeOrmModule.forFeature([Usertyp]),
  в app.module.ts*/
export class UserBan {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public isBanned: boolean;

  @Column()
  public banReason: string;

  @Column()
  public blogId: string;

  @Column()
  public banUserId: string;

  @Column()
  public login: string;

  @Column()
  public createdAt: string;

  @ManyToOne(() => Blogtyp, 'userBan')
  public blogtyp: Blogtyp;
}
