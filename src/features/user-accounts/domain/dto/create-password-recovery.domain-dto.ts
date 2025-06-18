export class CreatePasswordRecoveryDomainDto {
  recoveryCodeHash: string;
  recoveryCodeLifetimeInSeconds: number;
}
