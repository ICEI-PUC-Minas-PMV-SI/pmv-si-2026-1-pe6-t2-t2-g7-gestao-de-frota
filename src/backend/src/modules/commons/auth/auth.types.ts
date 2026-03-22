import { IUserJsonProps, TUserProviderType } from './models/User.model';

export const AuthTypes = {
  ID_TOKEN: 'ID_TOKEN',
};

export interface ITokenPayload {
  uid: string;
  name: string;
  email: string;
  provider: TUserProviderType;
}

export interface IUserContainer {
  payload: ITokenPayload;
  user: IUserJsonProps;
}
