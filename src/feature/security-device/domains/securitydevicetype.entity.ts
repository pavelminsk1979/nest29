/*безопасный девайс НЕ ХАКЕРА А МОЙ*/
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usertyp } from '../../users/domains/usertyp.entity';

@Entity()
export class Securitydevicetyp {
  /*
    эта таблица вторичный ключ имеет
    и в ней будет много сущностей
    которые пренадлежат одному из юзеров
  
    @Entity()
    export class Securitydevicetyp {
    @ManyToOne(() => Usertyp, 'securitydevicetyp')
    public usertyp: Usertyp;
  
  
  
  ------@ManyToOne(() => Usertyp, 'securitydevicetyp')
  
  --первое значение    --- () => Usertyp--это
    функция и она возвращает  ТИП(типизация) того класса
    С КОТОРЫМ СВЯЗЬ  НАСТРАИВАЮ
  
  --второе значение  'securitydevicetyp'  -это так назвал
    я колонку
    в таблице (в классе) Usertyp  и с этой
    колонкой   будет связь
  
  ------- public usertyp: Usertyp;----чтоб
    видно было что  связь  именно c  таблицей
    Securitydevicetyp
    */
  @ManyToOne(() => Usertyp, 'securitydevicetyp')
  public usertyp: Usertyp;
  @PrimaryGeneratedColumn('uuid')
  public deviceId: string;
  @Column()
  public issuedAtRefreshToken: string;
  @Column()
  public ip: string;
  @Column()
  public nameDevice: string;
}
