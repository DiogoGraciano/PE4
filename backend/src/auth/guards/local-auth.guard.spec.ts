import { LocalAuthGuard } from './local-auth.guard';

describe('LocalAuthGuard', () => {
  it('é instanciável', () => {
    const guard = new LocalAuthGuard();
    expect(guard).toBeDefined();
  });
});
