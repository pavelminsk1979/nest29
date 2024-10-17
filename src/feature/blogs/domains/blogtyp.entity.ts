import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Posttyp } from '../../posts/domains/posttyp.entity';

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
}
