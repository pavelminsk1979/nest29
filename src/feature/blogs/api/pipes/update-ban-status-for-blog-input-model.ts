import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateBanStatusForBlogInputModel {
  @IsBoolean()
  @IsNotEmpty()
  isBanned: boolean;
}
