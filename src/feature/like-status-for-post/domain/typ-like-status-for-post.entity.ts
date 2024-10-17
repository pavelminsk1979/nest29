import { LikeStatus } from '../../../common/types';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Posttyp } from '../../posts/domains/posttyp.entity';
import { Usertyp } from '../../users/domains/usertyp.entity';

@Entity()
export class LikeStatusForPostTyp {
  @ManyToOne(() => Posttyp, 'likeStatusForPostTyp')
  public posttyp: Posttyp;

  @ManyToOne(() => Usertyp, 'likeStatusForPostTyp')
  public usertyp: Usertyp;

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  likeStatus: LikeStatus;

  @Column()
  addedAt: string;

  @Column()
  login: string;
}
