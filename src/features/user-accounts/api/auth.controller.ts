import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { MeViewDto } from './view-dto/users.view-dto';
import { AuthQueryRepository } from '../infrastructure/query/auth.query-repository';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';
import { UsersService } from '../application/users.service';
import { RegistrationEmailResendingInputDto } from './input-dto/registration-email-resending.input-dto';
import { RegistrationConfirmationCodeInputDto } from './input-dto/registration-confirmation-code.input-dto';
import { PasswordRecoveryInputDto } from './input-dto/password-recovery.input-dto';
import { NewPasswordRecoveryInputDto } from './input-dto/new-password-recovery.input-dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private authQueryRepository: AuthQueryRepository,
    private usersService: UsersService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.login(user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@ExtractUserFromRequest() user: UserContextDto): Promise<MeViewDto> {
    return this.authQueryRepository.me(user.id);
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async register(@Body() body: CreateUserInputDto): Promise<void> {
    await this.usersService.registerUser(body);
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendRegistrationEmail(
    @Body() body: RegistrationEmailResendingInputDto,
  ): Promise<void> {
    await this.authService.resendRegistrationEmail(body.email);
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmRegistration(
    @Body() body: RegistrationConfirmationCodeInputDto,
  ): Promise<void> {
    await this.authService.confirmRegistration(body.code);
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async recoverPassword(@Body() body: PasswordRecoveryInputDto): Promise<void> {
    await this.authService.recoverPassword(body.email);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async setNewPassword(
    @Body() body: NewPasswordRecoveryInputDto,
  ): Promise<void> {
    await this.authService.setNewPassword(body.newPassword, body.recoveryCode);
  }
}
