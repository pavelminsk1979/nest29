import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBan } from '../domains/user-ban.entity';
import { CreateBanUser } from '../api/types/dto';

@Injectable()
export class UserBanRepository {
  constructor(
    @InjectRepository(UserBan)
    private readonly userBanRepository: Repository<UserBan>,
  ) {}

  async createBanUser(newBanUser: CreateBanUser) {
    const userBan = new UserBan();

    userBan.login = newBanUser.login;
    userBan.blogId = newBanUser.blogId;
    userBan.banUserId = newBanUser.banUserId;
    userBan.createdAt = newBanUser.createdAt;
    userBan.isBanned = newBanUser.isBanned;
    userBan.banReason = newBanUser.banReason;
    userBan.blogtyp = newBanUser.blogtyp;

    const result = await this.userBanRepository.save(userBan);

    if (result) return true;

    return false;
  }

  async findItemByBlogIdOrUserId(blogId: string, userId: string) {
    const result = await this.userBanRepository.find({
      where: { blogId, banUserId: userId },
    });

    /* в переменной result будет содержаться массив
    объектов пользователей, которые удовлетворяют
    условиям поиска по логину или почте*/
    if (result.length === 0) return false;
    return true;
  }
}

/* async isExistLogin(login: string) {
   const result = await this.usertypRepository.findOne({
     where: { login: login },
   });

   /!* в result будет или null или найденая сущность в базе в виде 
    обьекта со свойствами*!/

   if (!result) return null;

   return true;
 }*/

/* async isExistEmail(email: string) {
   const result = await this.usertypRepository.findOne({
     where: { email: email },
   });

   /!* в result будет или null или найденая сущность в базе в виде 
    обьекта со свойствами*!/

   if (!result) return null;

   return true;
 }*/

/* async findUserByCode(code: string) {
   const result: CreateUserWithId | null =
     await this.usertypRepository.findOne({
       where: { confirmationCode: code },
     });

   /!* в result будет или null или найденая сущность в базе в виде
    обьекта со свойствами*!/

   return result;
 }*/

/* async changeUser(user: CreateUserWithId) {
   const result = await this.usertypRepository.save(user);

   /!*  метод save() в TypeORM возвращает сохраненный объект, 
       если операция прошла успешно, или undefined, 
       если сохранение не удалось.*!/

   if (!result) return false;
   return true;
 }*/

/* async findUserByLoginOrEmail(loginOrEmail: string) {
   const result = await this.usertypRepository.find({
     where: [{ login: loginOrEmail }, { email: loginOrEmail }],
   });

   /!* в переменной result будет содержаться массив
    объектов пользователей, которые удовлетворяют 
    условиям поиска по логину или почте*!/
   if (result.length === 0) return null;
   return result[0];
 }*/

/* async findUserByEmail(email: string) {
   const result = await this.usertypRepository.find({
     where: { email },
   });

   /!* в переменной result будет содержаться массив
    объектов пользователей, которые удовлетворяют 
    условиям поиска по логину или почте*!/
   if (result.length === 0) return null;
   return result[0];
 }*/

/* async getUserById(userId: string) {
   const result = await this.usertypRepository.find({
     where: { id: userId },
   });

   /!* в переменной result будет содержаться массив
объектов пользователей, которые удовлетворяют 
условиям поиска по логину или почте*!/

   if (result.length === 0) return null;
   return result[0];
 }*/

/* async deleteUserById(userId: string) {
   const result = await this.usertypRepository.delete({ id: userId });
   /!* если удаление не удалось, result может быть undefined 
или содержать информацию об ошибке,*!/

   if (result.affected === 0) return false;
   /!*Если удаление прошло успешно, result
   содержать объект DeleteResult
   --можете получить доступ к количеству удаленных
   записей так: result.affected.*!/
   return true;
 }*/
