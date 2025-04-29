import { ThrottlerGuard } from '@nestjs/throttler';

export class ThrottlerGuardMock extends ThrottlerGuard {
  async canActivate(): Promise<boolean> {
    return true;
  }
}
