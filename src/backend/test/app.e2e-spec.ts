import request from 'supertest';
import { getE2eHttpServer } from './e2e/setup';

describe('AppModule (e2e)', () => {
  it('deve carregar os controllers protegidos pelo AuthGuard global', async () => {
    await request(getE2eHttpServer()).get('/members').expect(403);
  });
});
