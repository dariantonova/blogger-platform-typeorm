import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-tokens.inject-constants';
import { RefreshJWTPayload } from '../../dto/refresh-jwt-payload';

export class LoginUserCommand {
  constructor(public dto: { userId: string }) {}
}

export class LoginResultDto {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: number;
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase
  implements ICommandHandler<LoginUserCommand, LoginResultDto>
{
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
  ) {}

  async execute({ dto }: LoginUserCommand): Promise<LoginResultDto> {
    const accessToken = this.accessTokenContext.sign({ userId: dto.userId });

    const refreshToken = this.refreshTokenContext.sign({
      userId: dto.userId,
      deviceId: 'deviceId',
    });

    const refreshTokenPayload: RefreshJWTPayload =
      this.refreshTokenContext.decode(refreshToken);

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt: refreshTokenPayload.exp,
    };
  }
}
