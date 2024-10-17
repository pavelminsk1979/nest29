import { Model } from 'mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../domains/domain-user';
import { CreateUserInputModel } from '../api/pipes/create-user-input-model';
import { HashPasswordService } from '../../../common/service/hash-password-service';
import { v4 as randomCode } from 'uuid';
import { CreateUser } from '../api/types/dto';
import { UserSqlTypeormRepository } from '../repositories/user-sql-typeorm-repository';
import { Usertyp } from '../domains/usertyp.entity';

@Injectable()
/*@Injectable()-декоратор что данный клас
 инжектируемый--тобишь в него добавляются
 зависимости
 * ОБЯЗАТЕЛЬНО ДОБАВЛЯТЬ UsersService В ФАЙЛ app.module
 * providers: [AppService,UsersService]
 провайдер-это в том числе компонент котоый
 возможно внедрить как зависимость*/
export class UsersService {
  constructor(
    /* вот тут моделька втомчисле инжектится
    именно декоратор  @InjectModel  определяет
    что происходит инжектирование
      -- (User.name)  регистрируется по имени
       также как в   app.module  в  imports
       и это будет скорей всего строка 'user'
       --<UserDocument> это тип умного обьекта
       ---userModel - это  свойство текущего класса ,
       это будет ТОЖЕ КЛАСС-это и есть Моделька от mongoose.*/
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    protected hashPasswordService: HashPasswordService,
    protected userSqlTypeormRepository: UserSqlTypeormRepository,
  ) {}

  async createUser(createUserInputModel: CreateUserInputModel) {
    const { login, password, email } = createUserInputModel;

    /*   login и email  должны быть уникальные--поискать
       их в базе и если такие есть в базе то вернуть
       на фронт ошибку */

    const isExistLogin =
      await this.userSqlTypeormRepository.isExistLogin(login);

    if (isExistLogin) {
      throw new BadRequestException([
        {
          message: 'field login must be unique',
          field: 'login',
        },
      ]);
    }

    const isExistEmail =
      await this.userSqlTypeormRepository.isExistEmail(email);

    if (isExistEmail) {
      throw new BadRequestException([
        {
          message: 'field email must be unique',
          field: 'email',
        },
      ]);
    }

    const passwordHash = await this.hashPasswordService.generateHash(password);

    const newUser: CreateUser = {
      login,
      passwordHash,
      email,
      createdAt: new Date().toISOString(),
      confirmationCode: randomCode(),
      isConfirmed: true,
      expirationDate: new Date().toISOString(),
    };

    const result: Usertyp | null =
      await this.userSqlTypeormRepository.createNewUser(newUser);

    if (!result) return null;

    return {
      id: result.id,
      login: result.login,
      email: result.email,
      createdAt: result.createdAt,
    };
  }

  async deleteUserById(userId: string) {
    return this.userSqlTypeormRepository.deleteUserById(userId);
  }
}
