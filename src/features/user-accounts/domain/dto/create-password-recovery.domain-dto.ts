import { User } from '../user.entity';

export class CreatePasswordRecoveryDomainDto {
  recoveryCodeHash: string;
  recoveryCodeLifetimeInSeconds: number;
  user: User;
}
