import { IsBoolean, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateBanStatusInputModel {
  @IsBoolean()
  @IsNotEmpty()
  isBanned: boolean;

  @IsString()
  @IsNotEmpty()
  @MinLength(20, {
    message: 'Lengt field password should be less 21 simbols',
  })
  banReason: string;
}
