import { IsBoolean, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateBanStatusWithBlogIdInputModel {
  @IsBoolean()
  @IsNotEmpty()
  isBanned: boolean;

  @IsString()
  @IsNotEmpty()
  @MinLength(20, {
    message: 'Lengt field password should be less 21 simbols',
  })
  banReason: string;

  @IsString()
  @IsNotEmpty()
  blogId: string;
}
