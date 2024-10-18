import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Posttyp } from '../../posts/domains/posttyp.entity';
import { Usertyp } from '../../users/domains/usertyp.entity';

@Entity()
/*не создает таблицы без
TypeOrmModule.forFeature([Usertyp]),
  в app.module.ts*/
export class Blogtyp {
  @OneToMany(() => Posttyp, 'blogtyp')
  public posttyp: Posttyp;

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ collation: 'C' })
  name: string;

  @Column()
  description: string;

  @Column()
  websiteUrl: string;

  @Column()
  createdAt: string;

  @Column()
  isMembership: boolean;

  @ManyToOne(() => Usertyp, (usertyp) => usertyp.blogtyp, { nullable: true })
  public usertyp: Usertyp | null;
}
