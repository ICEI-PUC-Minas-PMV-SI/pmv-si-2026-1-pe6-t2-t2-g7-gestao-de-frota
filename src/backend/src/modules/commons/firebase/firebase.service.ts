import { Injectable, OnModuleInit } from '@nestjs/common';
import admin, { ServiceAccount } from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app: admin.app.App;

  onModuleInit() {
    const cred = process.env.FIREBASE_SA_CRED;
    if (!cred) throw new Error('FIREBASE_SA_CRED was not defined properly!');
    this.app = admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(cred) as ServiceAccount),
    });
  }

  get client() {
    return this.app;
  }
}
