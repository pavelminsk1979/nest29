import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { LoginInputModel } from './pipes/login-input-model';
import { AuthService } from '../services/auth-service';
import { RegistrationInputModel } from './pipes/registration-input-model';
import { RegistrationConfirmationInputModel } from './pipes/registration-comfirmation-input-model';
import { RegistrationEmailResendingInputModel } from './pipes/registration-email-resending-input-model';
import { PasswordRecoveryInputModel } from './pipes/password-recovery-input-model';
import { NewPasswordInputModel } from './pipes/new-password-input-model';
import { Response, Request } from 'express';
import { RefreshTokenGuard } from '../../../common/guard/refresh-token-guard';
import { SecurityDeviceService } from '../../security-device/services/security-device-service';
import { AuthTokenGuard } from '../../../common/guard/auth-token-guard';
import { ViewForMeRequest } from './types/view';
import { VisitLimitGuard } from '../../../common/guard/visit-limit-guard';

@Controller('auth')
export class AuthController {
  constructor(
    protected authService: AuthService,
    protected securityDeviceService: SecurityDeviceService,
  ) {}

  @UseGuards(VisitLimitGuard)

  /*тут ЛОГИНИЗАЦИЯ  реализована с МУЛЬТИДЕВАЙСНОСТЬЮ*/
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async handleLogin(
    @Body() loginInputModel: LoginInputModel,
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ): Promise<{ accessToken: string } | null> {
    const result: { accessToken: string; refreshToken: string } | null =
      await this.authService.loginUser(loginInputModel, request);

    if (result) {
      /* { httpOnly: true, secure: true } - это опции для cookie:
         httpOnly: true означает, что cookie будет доступно только для
          HTTP-запросов, а не для JavaScript-скриптов на клиенте.
         secure: true означает, что cookie будет передаваться только по
          защищенному (HTTPS) соединению.*/
      response.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: true,
      });
      return { accessToken: result.accessToken };
    } else {
      /* (401 Unauthorized). Это означает, что клиент не авторизован для доступа к запрашиваемому ресурсу*/
      throw new UnauthorizedException(
        "user didn't login:andpoint-post,url-auth/login",
      );
    }
  }

  @UseGuards(VisitLimitGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  async handleRegistration(
    @Body() registrationInputModel: RegistrationInputModel,
  ) {
    const result = await this.authService.registrationUser(
      registrationInputModel,
    );

    if (result) {
      return;
    } else {
      throw new BadRequestException([
        {
          message: 'Not create newUser',
          field: 'andpoint-registration,method-post',
        },
      ]);
    }
  }

  @UseGuards(VisitLimitGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  async handleRegistrationConfirmation(
    @Body()
    registrationConfirmationInputModel: RegistrationConfirmationInputModel,
  ) {
    const result: boolean = await this.authService.registrationConfirmation(
      registrationConfirmationInputModel,
    );

    if (result) {
      return;
    } else {
      throw new BadRequestException([
        { message: 'code already confirmed', field: 'code' },
      ]);
    }
  }

  @UseGuards(VisitLimitGuard)
  @HttpCode(HttpStatus.NO_CONTENT)

  /*  если подтверждение регистрации НЕ ПРИШЛО 
    НА ПОЧТУ ... 
     -на этот эндпоинт повторно придет емаил
     -проверю что в базе isConfirmed ===false
     -cтавлю новую дату протухания
     --новый КОД
     -заново отправляю письмо на почту*/
  @Post('registration-email-resending')
  async handleRegistrationEmailResending(
    @Body()
    registrationEmailResendingInputModel: RegistrationEmailResendingInputModel,
  ) {
    const { email } = registrationEmailResendingInputModel;

    const result: boolean =
      await this.authService.registrationEmailResending(email);

    if (result) {
      return;
    } else {
      throw new BadRequestException([
        { message: 'email already confirmed', field: 'email' },
      ]);
      /*     throw new NotFoundException(
             'email resending failed :andpoint-auth,url-auth/registration-email-resending',
           );*/
    }
  }

  @UseGuards(VisitLimitGuard)
  /*1003 конспект- дошанка*/
  @HttpCode(HttpStatus.NO_CONTENT)
  /*
  предварительно должно  регистрация и registration-confirmation

  -ЕСЛИ ЗАБЫЛ ПАРОЛЬ -МОЖНО ВОСТАНОВИТЬ
  -эндпоинт ожидает email
  -найдет юзера в базе
  --установит новый КОД и дату протухания этого кода
  -отправит этот КОД на почту
  ---ДАЛЕЕ СМЫСЛ ТАКОЙ ЧТО ИЗ ПОЧТЫ КОД
  ДОЛЖЕН ПОПАСТЬ НА ФРОНТЕНД А НА ФРОНТЕНДЕ
  ДОБАВЯТ К КОДУ НОВЫЙ ПАРОЛЬ
  И ОТПРАВИТСЯ ЭТА ПАРОЧКА НА ЭНДПОИНТ 'auth\new-password'
  И ТОЛЬКО там сменится passwordHash в базе у Юзера
   */
  @Post('password-recovery')
  async handlePasswordRecovery(
    @Body()
    passwordRecoveryInputModel: PasswordRecoveryInputModel,
  ) {
    const { email } = passwordRecoveryInputModel;

    const result: boolean = await this.authService.passwordRecovery(email);

    if (result) {
      return;
    } else {
      throw new NotFoundException(
        'password recovery failed :andpoint-auth,url-auth/password-recovery',
      );
    }
  }

  @UseGuards(VisitLimitGuard)
  /*новый пароль... и в базу данных помещаю
ХЭШНОВОГОПАРОЛЯ(passwordHash).  В теле запроса приходит КОД и новый пароль*/
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('new-password')
  async handleNewPassword(
    @Body()
    newPasswordInputModel: NewPasswordInputModel,
  ) {
    debugger;
    const result: boolean = await this.authService.newPassword(
      newPasswordInputModel,
    );

    if (result) {
      return;
    } else {
      throw new NotFoundException(
        'new-password failed :andpoint-auth,url-auth/new-password',
      );
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  async handleRefreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken: string = request.cookies.refreshToken;
    const result: { newAccessToken: string; newRefreshToken: string } | null =
      await this.authService.updateTokensForRequestRefreshToken(refreshToken);

    if (result) {
      /* { httpOnly: true, secure: true } - это опции для cookie:
         httpOnly: true означает, что cookie будет доступно только для
          HTTP-запросов, а не для JavaScript-скриптов на клиенте.
         secure: true означает, что cookie будет передаваться только по защищенному (HTTPS) соединению.*/
      response.cookie('refreshToken', result.newRefreshToken, {
        httpOnly: true,
        secure: true,
      });
      return { accessToken: result.newAccessToken };
    } else {
      /* (401 Unauthorized). Это означает, что клиент не авторизован для доступа к запрашиваемому ресурсу*/
      throw new UnauthorizedException(
        "user didn't login:andpoint-post,url-auth/login",
      );
    }
  }

  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  /*удалить одну запись - один девайс 
  из таблицы Securitydevicetyp*/
  @Post('logout')
  async handleLogout(@Req() request: Request) {
    const deviceId = request['deviceId'];
    debugger;
    const issuedAtRefreshToken = request['issuedAtRefreshToken'];

    const result = await this.securityDeviceService.logout(
      deviceId,
      issuedAtRefreshToken,
    );

    if (result) {
      return;
    } else {
      throw new NotFoundException(
        "user didn't logout:andpoint-auth/logout,method - post",
      );
    }
  }

  @UseGuards(AuthTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Get('me')
  async handleMe(@Req() request: Request) {
    const userId = request['userId'];

    const result: ViewForMeRequest | null =
      await this.authService.createViewModelForMeRequest(userId);

    if (result) {
      return result;
    } else {
      throw new NotFoundException(
        "user didn't logout:andpoint-auth/me,method - get",
      );
    }
  }
}
