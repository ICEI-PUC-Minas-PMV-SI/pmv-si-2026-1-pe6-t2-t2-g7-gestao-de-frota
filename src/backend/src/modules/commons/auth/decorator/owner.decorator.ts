import { SetMetadata } from '@nestjs/common';

export const OWNER_KEY = 'owner';
export const PreventOwners = (key: string) => SetMetadata(OWNER_KEY, key);
