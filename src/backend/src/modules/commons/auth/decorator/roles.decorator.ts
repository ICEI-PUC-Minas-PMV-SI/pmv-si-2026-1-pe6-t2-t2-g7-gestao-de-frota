import { SetMetadata } from '@nestjs/common';
import { TUserRole } from '../models/User.model';

export const ROLES_KEYS = 'roles';
export const Roles = (...roles: TUserRole[]) => SetMetadata(ROLES_KEYS, roles);
