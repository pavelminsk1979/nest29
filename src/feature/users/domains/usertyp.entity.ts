import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Securitydevicetyp } from '../../security-device/domains/securitydevicetype.entity';
import { LikeStatusForPostTyp } from '../../like-status-for-post/domain/typ-like-status-for-post.entity';

@Entity()
/*не создает таблицы без
TypeOrmModule.forFeature([Usertyp]),
  в app.module.ts*/
export class Usertyp {
  /*-----@OneToMany(() => Securitydevicetyp, 'usertyp')
  
  --первое значение    --- () => Securitydevicetyp--это
    функция и она возвращает  ТИП(типизация) того класса
    С КОТОРЫМ СВЯЗЬ  НАСТРАИВАЮ
  
  --второе значение  'usertyp'  -это так назвал я колонку
    в таблице (в классе) Securitydevicetyp   и с этой
    колонкой  'usertyp'  будет связь--- эта колонка
    вторичный ключ
  
  ------- public securitydevicetyp: Securitydevicetyp;----чтоб
    видно было что  связь  именно c  таблицей
    Securitydevicetyp*/

  @OneToMany(() => Securitydevicetyp, 'usertyp')
  public securitydevicetyp: Securitydevicetyp;

  /*----- @PrimaryGeneratedColumn()  декоратор определяет
    поле которое является главнымКлючом
    ОБЯЗАТЕЛЬНО НАДО СОЗДАТЬ ТАКУЮ КАЛОНКУ В КАЖДОЙ
    ТАБЛИце с таким декоратором
  -для типа данных  можно  @PrimaryGeneratedColumn('uuid')
  ---если по умолчанию вроде будет считать
    1,2,3,4 и так далее
    причем если удалить значения то вроде не с еденицы
    продолжит а с места остановки*/
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  /*  @Column()  много доп свойств - надо провалится
    в него и покапатся--- также можно провалитватся
    во внутренние - вроде в типы надо проваливатся а не
    в значения

    например
@Column({nullable:true})  если поле может быть null


например
@Column({default:'22222'})  можно значение по дефолту

    */

  @Column({ collation: 'C' })
  public login: string;

  @Column()
  public passwordHash: string;

  @Column()
  public email: string;

  @Column()
  public createdAt: string;

  @Column()
  public confirmationCode: string;

  @Column()
  public isConfirmed: boolean;

  @Column()
  public expirationDate: string;

  @OneToMany(() => LikeStatusForPostTyp, 'usertyp')
  public likeStatusForPostTyp: LikeStatusForPostTyp;
}

/*
ПРИМЕР СВЯЗИ ОДИН К ОДНОМУ С КЛАССОМ
Securitydevicetyp--- ОН ТАКЖЕ ВНИЗУ ЭТОГО ФАЙЛА  ЕСТЬ
*/

/*
@Entity()
export class Usertyp {
  /!*
    связь ОДИН К ОДНОМУ   coздаю c таблицей из
    файла  securitydevicetype.entity.ts

    документация на эту тему
    https://typeorm.io/one-to-one-relations


  -----@OneToOne() этот декоратор приписываю
    в обоих классах  но чтоб понимать где
    первичный ключ а где вторичный
    то дабавлю ТУДА ГДЕ ВТОРИЧНЫЙ КЛЮЧ
    ДЕКОРАТОР  @JoinColumn()

 -----у  Usertyp будет первичный ключ

  ----у  Securitydevicetyp   будет вторичный ключ


  ...................................

  -----и чтобы в классе   Usertyp  видно было что данная
    таблица имеет связь с другой таблицей
    и чтоб видно было что это именно таблица Securitydevicetyp
    НАДО  прописать  в   классе Usertyp  как  колонку
    НО эта колонка  НЕ БУДЕТ ОТОБРАЖАТСЯ В pgAdmin в
    таблице Usertyp  и пометить ее декоратором  @OneToOne



  ----в классе  Securitydevicetyp  прописываю колонку
    и эта колонка появится в базе в таблице  НО К НАЗВАНИЮ
    КОТОРОЕ УКАЗАЛ Я    к usertyp  добавится название
    колонки с первичным ключом из таблицы Usertyp
  ---- тобиш в таблице   Securitydevicetyp     будет колонка usertypId

    @Entity()
    export class Securitydevicetyp {
    @OneToOne()
    @JoinColumn()
    public usertyp: Usertyp;


  .....................................
  ////////////////////////////////////////////////
  @Entity()
    export class Usertyp {
    @OneToOne(() => Securitydevicetyp, (sd) => sd.usertyp)
    public securitydevicetyp: Securitydevicetyp;

   @Entity()
    export class Securitydevicetyp {
    @OneToOne(() => Usertyp, (u) => u.securitydevicetyp)
    @JoinColumn()
    public usertyp: Usertyp;

 ----- ()=>Securitydevicetyp     и    ()=>Usertyp
    это  первый  параметр и это  функция которая
    должна вернуть ТИП ОБЬЕКТА С КОТОРЫМ СВЯЗЬ
    НАСТРАИВАЮ

 ---------  sd=>sd.usertyp    и      u=>u.securitydevicetyp
    это вторые параметры
    ОНИ ДРУГ НА ДРУГА
    УКАЗЫВАЮТ,    sd  это я сократил Securitydevicetyp
    u  это я сократил Usertyp*!/

  @OneToOne(() => Securitydevicetyp, (sd) => sd.usertyp)
  public securitydevicetyp: Securitydevicetyp;

  /!*----- @PrimaryGeneratedColumn()  декоратор определяет
    поле которое является главнымКлючом
    ОБЯЗАТЕЛЬНО НАДО СОЗДАТЬ ТАКУЮ КАЛОНКУ В КАЖДОЙ
    ТАБЛИце с таким декоратором
  -для типа данных  можно  @PrimaryGeneratedColumn('uuid')
  ---если по умолчанию вроде будет считать
    1,2,3,4 и так далее
    причем если удалить значения то вроде не с еденицы
    продолжит а с места остановки*!/
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  /!*  @Column()  много доп свойств - надо провалится
    в него и покапатся--- также можно провалитватся
    во внутренние - вроде в типы надо проваливатся а не
    в значения

    например
@Column({nullable:true})  если поле может быть null


например
@Column({default:'22222'})  можно значение по дефолту

    *!/

  @Column()
  public login: string;

  @Column()
  public passwordHash: string;

  @Column()
  public email: string;

  @Column()
  public createdAt: Date;

  @Column()
  public confirmationCode: string;

  @Column()
  public isConfirmed: boolean;

  @Column()
  public expirationDate: Date;
}

/!*
@CreateDateColumn()   дата будет создаватся автоматически
@UpdateDateColumn()  при обновлении сущности
автоматом обновит дату*!/*/

/*


import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usertyp } from '../../users/domains/usertyp.entity';

@Entity()
export class Securitydevicetyp {
  @OneToOne(() => Usertyp, (u) => u.securitydevicetyp)
  @JoinColumn()
  public usertyp: Usertyp;
  @PrimaryGeneratedColumn('uuid')
  public deviceId: string;
  @Column()
  public issuedAtRefreshToken: string;
  @Column()
  public ip: string;
  @Column()
  public nameDevice: string;
}*/
