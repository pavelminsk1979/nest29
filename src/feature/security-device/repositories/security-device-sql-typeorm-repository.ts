import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Securitydevicetyp } from '../domains/securitydevicetype.entity';

@Injectable()
/*@Injectable()-декоратор что данный клас инжектируемый
 * ОБЯЗАТЕЛЬНО ДОБАВЛЯТЬ его В ФАЙЛ app.module
 * providers: []*/
export class SecurityDeviceSqlTypeormRepository {
  constructor(
    @InjectRepository(Securitydevicetyp)
    private readonly securitydeviceRepository: Repository<Securitydevicetyp>,
  ) {}

  async createNewSecurityDevice(newDevice: Securitydevicetyp) {
    const device = new Securitydevicetyp();
    device.deviceId = newDevice.deviceId;
    device.nameDevice = newDevice.nameDevice;
    device.ip = newDevice.ip;
    device.issuedAtRefreshToken = newDevice.issuedAtRefreshToken;
    device.usertyp = newDevice.usertyp;
    const result = await this.securitydeviceRepository.save(device);
    return result;
  }

  async findDeviceByIdAndDate(deviceId: string, issuedAtRefreshToken: string) {
    const result = await this.securitydeviceRepository.findOne({
      where: { deviceId, issuedAtRefreshToken },
    });
    /*  Если сущность  с таким deviceId
     и issuedAtRefreshToken будет найдено в базе
      данных, то в result будет содержаться
       объект . Если ничего не будет найдено,
        то result будет равен undefined*/

    if (!result) return null;
    return result;
  }

  async deleteDeviceByDeviceId(deviceId: string) {
    const result = await this.securitydeviceRepository.delete({ deviceId });

    /* если удаление не удалось, result может быть undefined 
     или содержать информацию об ошибке,*/
    if (!result) return false;
    /*Если удаление прошло успешно, result
    содержать объект DeleteResult
    --можете получить доступ к количеству удаленных
    записей так: result.affected.*/
    return true;
  }

  async findDeviceAndUserByIdAndDate(
    deviceId: string,
    issuedAtRefreshToken: string,
  ) {
    const result: Securitydevicetyp | null =
      await this.securitydeviceRepository.findOne({
        where: { deviceId, issuedAtRefreshToken },
        relations: {
          usertyp: true,
        },
      });

    /*
    ---Если запись не будет найдена (то есть result
        будет null)
        -----Если запись будет найдена вернется обьект - сущность
        ДЕВАЙС с полем  usertyp и у поля usertyp будет
         значение - это обьект user
        
        */

    if (!result) return null;
    return result;
  }

  async changeDevice(newDevice: Securitydevicetyp) {
    const result = await this.securitydeviceRepository.save(newDevice);

    /*  метод save() в TypeORM возвращает сохраненный объект,
        если операция прошла успешно, или undefined,
        если сохранение не удалось.*/

    if (!result) return false;
    return true;
  }

  async getAllDevicesCorrectUser(userId: string) {
    const result = await this.securitydeviceRepository.find({
      where: { usertyp: { id: userId } },
    });

    /* в result  будет или пустой массив
    или массив найденых обьектов*/

    return result;
  }

  async findDeviceByDeviceId(deviceId: string) {
    const result = await this.securitydeviceRepository.findOne({
      where: { deviceId },
    });
    /*  Если сущность  с таким deviceId
  будет найдено в базе
   данных, то в result будет содержаться
    объект . Если ничего не будет найдено,
     то result будет равен undefined*/

    if (!result) return null;
    return result;
  }

  async findDeviceAndUserByDeviceId(deviceId: string) {
    const result = await this.securitydeviceRepository.findOne({
      where: { deviceId },
      relations: {
        usertyp: true,
      },
    });
    /*
---Если запись не будет найдена (то есть result
    будет null)
    -----Если запись будет найдена вернется обьект - сущность
    ДЕВАЙС с полем  usertyp и у поля usertyp будет
     значение - это обьект user
    
    */

    if (!result) return null;
    return result;
  }

  async findDeviceByUserIdAndDeviceId(userId: string, deviceId: string) {
    const result = await this.securitydeviceRepository.findOne({
      where: { deviceId, usertyp: { id: userId } },
    });

    /*   ---Если запись не будет найдена (то есть result
       будет null)
       -----Если запись будет найдена вернется обьект - сущность
       ДЕВАЙС с полем  usertyp и у поля usertyp будет
       значение - это обьект user*/

    if (!result) return null;
    return result;
  }

  async deleteDevicesExeptCurrentDevice(userId: string, deviceId: string) {
    await this.securitydeviceRepository.delete({
      usertyp: { id: userId },
      deviceId: Not(deviceId),
    });
    return true;
    /*    //////////////////////////////////////
                    ОДИН ВАРИАНТ
          ///////////////////////////////////
        // Находим все девайсы  для данного userId
        const arrayDevicesForCorrectUser = await this.securitydeviceRepository.find(
          { where: { usertyp: { id: userId } } },
        );
  
        /!*Массив обьектов
        кроме того обьекта у которого deviceId   пришла из всне
        *!/
  
        const array = arrayDevicesForCorrectUser.filter(
          (dev: Securitydevicetyp) => dev.deviceId !== deviceId,
        );
  
        await this.securitydeviceRepository.remove(array);
  
        return true;
        /////////////////////////////////////////*/
  }

  /*
    async findDeviceByIdAndDate(deviceId: string, issuedAtRefreshToken: string) {
      const result = await this.dataSource.query(
        `
          select *
  from public."securityDevice" u
  where u."issuedAtRefreshToken" = $1
  and u."deviceId"  = $2
      `,
        [issuedAtRefreshToken, deviceId],
      );
      /!*в result будет  массив --- если не найдет запись ,
       тогда ПУСТОЙ МАССИВ,   если найдет запись
       тогда первым элементом в массиве будет обьект  а
       вторым элементом будет число указывающее сколько записей найдено, но у меня может быть только одна запись с такими полями *!/
      if (result[1] === 0) return false;
      return result[0];
    }
  
    async changeSecurityDevice(id: string, newIssuedAtRefreshToken: string) {
      const result = await this.dataSource.query(
        `
      update public."securityDevice"
      set "issuedAtRefreshToken"=$1
      where id = $2
      `,
        [newIssuedAtRefreshToken, id],
      );
      /!*    в result будет всегда  всегда первым
             элементом  ПУСТОЙ МАССИВ, а вторым элементом
             или НОЛЬ(если ничего не изменилось) или число-сколько  строк изменилось
             (в данном случае еденица будет
     вторым элементом масива )*!/
      if (result[1] === 0) return false;
      return true;
    }
  
    async findDeviceByDeviceId(deviceId: string) {
      const result = await this.dataSource.query(
        `
          select *
  from public."securityDevice" s
  where s."deviceId" = $1
      `,
        [deviceId],
      );
      debugger;
      /!*в result будет  массив --- если не найдет запись ,
          тогда ПУСТОЙ МАССИВ,   если найдет запись
          тогда первым элементом в массиве будет обьект *!/
      if (result.length === 0) return null;
  
      return result[0];
    }
  
    async findDeviceByUserIdAndDeviceIdFromParam(
      userId: string,
      deviceIdFromParam: string,
    ) {
      const result = await this.dataSource.query(
        `
          select *
  from public."securityDevice" u
  where u."userId" = $1
  and u."deviceId"  = $2
      `,
        [userId, deviceIdFromParam],
      );
      /!*в result будет  массив --- если не найдет запись ,
       тогда ПУСТОЙ МАССИВ,   если найдет запись
       тогда первым элементом в массиве будет обьект  а
       вторым элементом будет число указывающее сколько записей найдено, но у меня может быть только одна запись с такими полями *!/
      if (result[1] === 0) return false;
      return result[0];
    }
  
    async deleteDeviceByDeviceId(deviceId: string) {
      const result = await this.dataSource.query(
        `
  DELETE FROM public."securityDevice"
  WHERE "deviceId"=$1;
      `,
        [deviceId],
      );
  
      /!*    в result будет всегда массив с двумя элементами
       и всегда первым
           элементом будет ПУСТОЙ МАССИВ, а вторым элементом
           или НОЛЬ(если ничего не изменилось) или число-сколько
           строк изменилось(в данном случае еденица будет
   вторым элементом масива )*!/
  
      if (result[1] === 0) return false;
      return true;
    }
  
    async deleteDevicesExeptCurrentDevice(userId: string, deviceId: string) {
      /!* нужно удалить все устройства с приходящим  userId, за исключением deviceId который пришол. ТОЕСТЬ у юзера может быть 3 девайса и удалится 2, а тот с которого он запрос данный делает, тот останется в таблице.*!/
  
      const result = await this.dataSource.query(
        `
      DELETE FROM public."securityDevice" s
      WHERE "userId"=$1 AND "deviceId" <> $2;
      `,
        [userId, deviceId],
      );
  
      /!*условие AND "deviceId" <> $2, --- гарантирует, что
      будут удалены ВСЕ устройства с userId, КРОМЕ
      устройства с указанным deviceId
  *!/
  
      if (result[1] === 0) return false;
      return true;
    }*/
}
