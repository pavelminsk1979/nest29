import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Posttyp } from '../../posts/domains/posttyp.entity';
import { LikeStatusForCommentTyp } from '../../like-status-for-comment/domain/typ-like-status-for-comment.entity';

@Entity()
export class Commenttyp {
  @OneToMany(() => LikeStatusForCommentTyp, 'commenttyp')
  public likeStatusForCommentTyp: LikeStatusForCommentTyp;

  @ManyToOne(() => Posttyp, 'commenttyp')
  public posttyp: Posttyp;

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  content: string;

  @Column()
  createdAt: string;

  @Column()
  userId: string;

  @Column()
  userLogin: string;
}
