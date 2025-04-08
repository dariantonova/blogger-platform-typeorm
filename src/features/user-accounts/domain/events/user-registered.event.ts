export class UserRegisteredEvent {
  constructor(
    public email: string,
    public confirmationCode: string,
  ) {}
}
