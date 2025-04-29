import { initApp } from '../helpers/helper';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AuthTestManager } from './helpers/auth.test-manager';

describe('auth rate limiting', () => {
  let app: INestApplication;
  let authTestManager: AuthTestManager;
  const EXPECTED_AUTH_THROTTLE_LIMIT = 5;

  beforeAll(async () => {
    app = await initApp({ overrideThrottlerGuard: false });

    authTestManager = new AuthTestManager(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should rate limit login endpoint', async () => {
    for (let i = 0; i < EXPECTED_AUTH_THROTTLE_LIMIT; i++) {
      await authTestManager.login({}, HttpStatus.UNAUTHORIZED);
    }

    await authTestManager.login({}, HttpStatus.TOO_MANY_REQUESTS);
  });

  it('should rate limit registration endpoint', async () => {
    for (let i = 0; i < EXPECTED_AUTH_THROTTLE_LIMIT; i++) {
      await authTestManager.register({}, HttpStatus.BAD_REQUEST);
    }

    await authTestManager.register({}, HttpStatus.TOO_MANY_REQUESTS);
  });

  it('should rate limit registration confirmation endpoint', async () => {
    for (let i = 0; i < EXPECTED_AUTH_THROTTLE_LIMIT; i++) {
      await authTestManager.confirmRegistration({}, HttpStatus.BAD_REQUEST);
    }

    await authTestManager.confirmRegistration({}, HttpStatus.TOO_MANY_REQUESTS);
  });

  it('should rate limit registration email resending endpoint', async () => {
    for (let i = 0; i < EXPECTED_AUTH_THROTTLE_LIMIT; i++) {
      await authTestManager.resendRegistrationEmail({}, HttpStatus.BAD_REQUEST);
    }

    await authTestManager.resendRegistrationEmail(
      {},
      HttpStatus.TOO_MANY_REQUESTS,
    );
  });

  it('should rate limit password recovery endpoint', async () => {
    for (let i = 0; i < EXPECTED_AUTH_THROTTLE_LIMIT; i++) {
      await authTestManager.recoverPassword({}, HttpStatus.BAD_REQUEST);
    }

    await authTestManager.recoverPassword({}, HttpStatus.TOO_MANY_REQUESTS);
  });

  it('should rate limit new password endpoint', async () => {
    for (let i = 0; i < EXPECTED_AUTH_THROTTLE_LIMIT; i++) {
      await authTestManager.setNewPassword({}, HttpStatus.BAD_REQUEST);
    }

    await authTestManager.setNewPassword({}, HttpStatus.TOO_MANY_REQUESTS);
  });
});
