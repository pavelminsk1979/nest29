import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blogtyp } from '../../blogs/domains/blogtyp.entity';
import { LikeStatusForPostTyp } from '../../like-status-for-post/domain/typ-like-status-for-post.entity';
import { Commenttyp } from '../../comments/domaims/commenttyp.entity';

@Entity()
/*не создает таблицы без
TypeOrmModule.forFeature([Usertyp]),
  в app.module.ts*/
export class Posttyp {
  @ManyToOne(() => Blogtyp, 'posttyp')
  public blogtyp: Blogtyp;

  @OneToMany(() => LikeStatusForPostTyp, 'posttyp')
  public likeStatusForPostTyp: LikeStatusForPostTyp;

  @OneToMany(() => Commenttyp, 'posttyp')
  public commenttyp: Commenttyp;

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  title: string;

  @Column()
  shortDescription: string;

  @Column()
  content: string;

  @Column()
  blogName: string;

  @Column()
  createdAt: string;
}
