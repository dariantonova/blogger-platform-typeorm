export class ConfirmationEmailResendRequestedEvent {
  constructor(
    public email: string,
    public confirmationCode: string,
  ) {}
}
