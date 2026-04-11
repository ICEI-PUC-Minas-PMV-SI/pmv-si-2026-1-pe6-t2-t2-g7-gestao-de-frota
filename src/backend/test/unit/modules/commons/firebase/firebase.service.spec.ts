jest.mock('firebase-admin', () => ({
  __esModule: true,
  default: {
    initializeApp: jest.fn(() => 'app-instance'),
    credential: {
      cert: jest.fn(() => 'cred-instance'),
    },
  },
}));

import admin from 'firebase-admin';
import { FirebaseService } from 'src/modules/commons/firebase/firebase.service';

describe('FirebaseService', () => {
  afterEach(() => {
    delete process.env.FIREBASE_SA_CRED;
  });

  it('deve inicializar o app com a credencial do ambiente', () => {
    process.env.FIREBASE_SA_CRED = JSON.stringify({
      projectId: 'test',
      clientEmail: 'test@test.com',
      privateKey: 'key',
    });
    const service = new FirebaseService();

    service.onModuleInit();

    expect(admin.credential.cert).toHaveBeenCalled();
    expect(admin.initializeApp).toHaveBeenCalled();
    expect(service.client).toBe('app-instance');
  });

  it('deve falhar sem FIREBASE_SA_CRED', () => {
    const service = new FirebaseService();

    expect(() => service.onModuleInit()).toThrow(
      'FIREBASE_SA_CRED was not defined properly!',
    );
  });
});
