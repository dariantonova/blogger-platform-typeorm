import { DataSource, SelectQueryBuilder } from 'typeorm';
import { UserConfirmation } from '../../../src/features/user-accounts/domain/user-confirmation.entity';
import { User } from '../../../src/features/user-accounts/domain/user.entity';
import { add } from 'date-fns';
import { PasswordRecovery } from '../../../src/features/user-accounts/domain/password-recovery.entity';

export class UserConfirmationInfoTestDto {
  isConfirmed: boolean;
  confirmationCode: string | null;
  expirationDate: Date | null;
}

export class UsersTestRepo {
  constructor(private dataSource: DataSource) {}

  async findUserConfirmationInfo(
    userId: string,
  ): Promise<UserConfirmationInfoTestDto> {
    const userConfirmation = await this.dataSource
      .getRepository(UserConfirmation)
      .findOne({ where: { userId: +userId } });

    expect(userConfirmation).not.toBeNull();

    return {
      isConfirmed: userConfirmation!.isConfirmed,
      confirmationCode: userConfirmation!.confirmationCode,
      expirationDate: userConfirmation!.expirationDate,
    };
  }

  async findUserConfirmationCode(userId: string): Promise<string> {
    const userConfirmation = await this.dataSource
      .createQueryBuilder()
      .select('uc.confirmation_code', 'confirmation_code')
      .from(UserConfirmation, 'uc')
      .where('uc.user_id = :userId', { userId: +userId })
      .getRawOne<{ confirmation_code: string | null }>();

    expect(userConfirmation).toBeDefined();
    expect(userConfirmation?.confirmation_code).not.toBeNull();

    return userConfirmation!.confirmation_code!;
  }

  async findConfirmationCodeOfLastCreatedUser(): Promise<string> {
    const confirmationSubQB = (qb: SelectQueryBuilder<any>) =>
      qb
        .select('uc.confirmation_code')
        .from(UserConfirmation, 'uc')
        .where('uc.user_id = u.id');

    const userConfirmation = await this.dataSource
      .createQueryBuilder()
      .select(confirmationSubQB, 'confirmation_code')
      .from(User, 'u')
      .orderBy('u.created_at', 'DESC')
      .limit(1)
      .getRawOne<{ confirmation_code: string | null }>();

    expect(userConfirmation).toBeDefined();
    expect(userConfirmation?.confirmation_code).not.toBeNull();

    return userConfirmation!.confirmation_code!;
  }

  async setUserPasswordRecoveryCodeHash(
    userId: string,
    recoveryCodeHash: string,
  ): Promise<void> {
    const expirationDate = add(new Date(), { hours: 2 });

    await this.dataSource
      .getRepository(PasswordRecovery)
      .upsert({ userId: +userId, recoveryCodeHash, expirationDate }, [
        'userId',
      ]);
  }

  async setUserPasswordRecoveryExpirationDate(
    userId: string,
    expirationDate: Date,
  ): Promise<void> {
    await this.dataSource
      .getRepository(PasswordRecovery)
      .update({ userId: +userId }, { expirationDate });
  }
}
