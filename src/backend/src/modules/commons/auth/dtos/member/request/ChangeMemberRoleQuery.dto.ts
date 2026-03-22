import { IsIn, IsString } from 'class-validator';
import { userRoleList } from '../../../models/User.model';

export class ChangeMemberRolesQueryDto {
  @IsString()
  @IsIn(userRoleList.filter((role) => role !== 'owner'))
  role: string;
}
