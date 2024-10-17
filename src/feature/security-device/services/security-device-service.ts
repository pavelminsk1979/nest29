import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SecurityDeviceRepository } from '../repositories/security-device-repository';
import { SecurityDeviceSqlRepository } from '../repositories/security-device-sql-repository';
import { SecurityDeviceSqlQueryRepository } from '../repositories/security-device-sql-query-repository';
import { SecurityDeviceSqlTypeormRepository } from '../repositories/security-device-sql-typeorm-repository';
import { Securitydevicetyp } from '../domains/securitydevicetype.entity';

@Injectable()
export class SecurityDeviceService {
  constructor(
    protected securityDeviceSqlTypeormRepository: SecurityDeviceSqlTypeormRepository,
  ) {}

  async getAllDevicesCorrectUser(
    deviceId: string,
    issuedAtRefreshToken: string,
  ) {
    const oneDevice: Securitydevicetyp | null =
      await this.securityDeviceSqlTypeormRepository.findDeviceAndUserByIdAndDate(
        deviceId,
        issuedAtRefreshToken,
      );

    if (!oneDevice) return null;

    const userId = oneDevice.usertyp.id;

    const arrDevices =
      await this.securityDeviceSqlTypeormRepository.getAllDevicesCorrectUser(
        userId,
      );

    const view = arrDevices.map((dev: Securitydevicetyp) => {
      return {
        ip: dev.ip,
        title: dev.nameDevice,
        lastActiveDate: dev.issuedAtRefreshToken,
        deviceId: dev.deviceId,
      };
    });
    return view;
  }

  async deleteDevicesExeptCurrentDevice(
    deviceId: string,
    issuedAtRefreshToken: string,
  ) {
    /*oneDevice и внутри будет вложеный обьект user*/

    const oneDevice =
      await this.securityDeviceSqlTypeormRepository.findDeviceAndUserByIdAndDate(
        deviceId,
        issuedAtRefreshToken,
      );

    if (!oneDevice) return null;

    const userId = oneDevice.usertyp.id;

    await this.securityDeviceSqlTypeormRepository.deleteDevicesExeptCurrentDevice(
      userId,
      deviceId,
    );

    return true;
  }

  async deleteDeviceByDeviceId(
    deviceIdFromRefreshToken: string,
    deviceIdFromParam: string,
  ) {
    const deviceForDelete =
      await this.securityDeviceSqlTypeormRepository.findDeviceByDeviceId(
        deviceIdFromParam,
      );

    if (!deviceForDelete) return null; //404

    /*   чтобы достать userId ТОГО 
       ПОЛЬЗОВАТЕЛЯ КОТОРЫЙ ДЕЛАЕТ ЗАПРОС 
       мне надо найти документ  по deviceIdFromRefreshToen

     --- и мне надо такой запрос чтоб он также вернул
     сущность ЮЗЕРА чтоб я айдишку юзера потом взял
       */

    const deviceCurrentUser =
      await this.securityDeviceSqlTypeormRepository.findDeviceAndUserByDeviceId(
        deviceIdFromRefreshToken,
      );

    if (!deviceCurrentUser) return null; //404

    const userId = deviceCurrentUser.usertyp.id;

    const correctDevice =
      await this.securityDeviceSqlTypeormRepository.findDeviceByUserIdAndDeviceId(
        userId,
        deviceIdFromParam,
      );

    if (!correctDevice) {
      /*   403 статус код */
      throw new ForbiddenException(
        ' not delete device :andpoint-security/devices/deviceId,method-delete',
      );
    }

    return this.securityDeviceSqlTypeormRepository.deleteDeviceByDeviceId(
      deviceIdFromParam,
    );
  }

  async logout(deviceId: string, issuedAtRefreshToken: string) {
    const oneDevice =
      await this.securityDeviceSqlTypeormRepository.findDeviceByIdAndDate(
        deviceId,
        issuedAtRefreshToken,
      );

    if (!oneDevice) {
      throw new UnauthorizedException(
        "user didn't logout because refreshToken not exist in BD :andpoint-auth/logout,method - post",
      );
    }
    return this.securityDeviceSqlTypeormRepository.deleteDeviceByDeviceId(
      deviceId,
    );
  }
}
