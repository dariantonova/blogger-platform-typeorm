import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

export class LoginUserCommand {
  constructor(public dto: { userId: string }) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase
  implements ICommandHandler<LoginUserCommand, { accessToken: string }>
{
  constructor(private jwtService: JwtService) {}

  async execute({ dto }: LoginUserCommand): Promise<{ accessToken: string }> {
    const accessToken = this.jwtService.sign({ id: dto.userId });
    return { accessToken };
  }
}
