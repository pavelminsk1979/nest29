import { LikeStatus } from '../../../common/types';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Commenttyp } from '../../comments/domaims/commenttyp.entity';

@Entity()
export class LikeStatusForCommentTyp {
  @ManyToOne(() => Commenttyp, 'likeStatusForCommentTyp')
  public commenttyp: Commenttyp;

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  userId: string;

  @Column()
  likeStatus: LikeStatus;

  @Column()
  addedAt: string;
}
