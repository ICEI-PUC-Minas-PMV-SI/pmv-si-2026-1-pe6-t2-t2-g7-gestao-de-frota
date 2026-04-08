import { VerifyTokenService } from '../../../../../../../src/modules/commons/auth/services/user/VerifyToken.service';
import { FirebaseService } from '../../../../../../../src/modules/commons/firebase/firebase.service';
import { ServiceError } from '../../../../../../../src/modules/commons/errors/Service.error';

describe('VerifyTokenService', () => {
  const makeService = (payload: Record<string, unknown>) => {
    const verifyIdToken = jest.fn(() => Promise.resolve(payload));
    const firebase = {
      client: {
        auth: jest.fn(() => ({ verifyIdToken })),
      },
    } as unknown as FirebaseService;

    return {
      service: new VerifyTokenService(firebase),
      firebase,
      verifyIdToken,
    };
  };

  it('deve retornar payload normalizado para token válido', async () => {
    const { service, verifyIdToken } = makeService({
      uid: 'firebase-uid',
      name: 'User Test',
      email: 'user@test.com',
      firebase: { sign_in_provider: 'password' },
    });

    await expect(service.exec({ idToken: 'valid-token' })).resolves.toEqual({
      uid: 'firebase-uid',
      name: 'User Test',
      email: 'user@test.com',
      provider: 'password',
    });
    expect(verifyIdToken).toHaveBeenCalledWith('valid-token', true);
  });

  it('deve usar name Not Provided quando token não tiver nome', async () => {
    const { service } = makeService({
      uid: 'firebase-uid',
      email: 'user@test.com',
      firebase: { sign_in_provider: 'google.com' },
    });

    await expect(service.exec({ idToken: 'valid-token' })).resolves.toEqual({
      uid: 'firebase-uid',
      name: 'Not Provided',
      email: 'user@test.com',
      provider: 'google.com',
    });
  });

  it('deve lançar ServiceError quando faltar email', async () => {
    const { service } = makeService({
      uid: 'firebase-uid',
      firebase: { sign_in_provider: 'password' },
    });

    await expect(
      service.exec({ idToken: 'invalid-token' }),
    ).rejects.toBeInstanceOf(ServiceError);
  });

  it('deve lançar ServiceError quando faltar sign_in_provider', async () => {
    const { service } = makeService({
      uid: 'firebase-uid',
      email: 'user@test.com',
      firebase: {},
    });

    await expect(
      service.exec({ idToken: 'invalid-token' }),
    ).rejects.toBeInstanceOf(ServiceError);
  });

  it('deve chamar verifyIdToken com checkRevoked true', async () => {
    const { service, verifyIdToken } = makeService({
      uid: 'firebase-uid',
      email: 'user@test.com',
      firebase: { sign_in_provider: 'password' },
    });

    await service.exec({ idToken: 'revocation-checked-token' });

    expect(verifyIdToken).toHaveBeenCalledWith(
      'revocation-checked-token',
      true,
    );
    expect(verifyIdToken).toHaveBeenCalledTimes(1);
  });
});
