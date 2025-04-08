export class PasswordRecoveryRequestedEvent {
  constructor(
    public email: string,
    public recoveryCode: string,
  ) {}
}
