import { User } from '../user.entity';

export class CreatePasswordRecoveryDomainDtoTypeorm {
  recoveryCodeHash: string;
  recoveryCodeLifetimeInSeconds: number;
  user: User;
}
