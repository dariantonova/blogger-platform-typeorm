import { DataSource } from 'typeorm';
import { add } from 'date-fns';

export class UserConfirmationInfoTestDto {
  isConfirmed: boolean;
  confirmationCode: string | null;
  expirationDate: Date | null;
}

export class UsersTestRepository {
  constructor(private dataSource: DataSource) {}

  async findUserConfirmationInfo(
    userId: string,
  ): Promise<UserConfirmationInfoTestDto> {
    const findQuery = `
    SELECT
    uc.is_confirmed, uc.confirmation_code, uc.expiration_date
    FROM user_confirmations uc
    WHERE user_id = $1;
    `;
    const findResult = await this.dataSource.query(findQuery, [+userId]);

    const userConfirmation = findResult[0];
    expect(userConfirmation).toBeDefined();

    return {
      isConfirmed: userConfirmation.is_confirmed,
      confirmationCode: userConfirmation.confirmation_code,
      expirationDate: userConfirmation.expiration_date,
    };
  }

  async findUserConfirmationCode(userId: string): Promise<string> {
    const findQuery = `
    SELECT
    uc.confirmation_code
    FROM user_confirmations uc
    WHERE user_id = $1;
    `;
    const findResult = await this.dataSource.query(findQuery, [+userId]);

    const userConfirmation = findResult[0];
    expect(userConfirmation).toBeDefined();
    expect(userConfirmation.confirmation_code).not.toBeNull();

    return userConfirmation.confirmation_code;
  }

  async findConfirmationCodeOfLastCreatedUser(): Promise<string> {
    const findQuery = `
    SELECT
    uc.confirmation_code
    FROM users u
    LEFT JOIN user_confirmations uc
    ON u.id = uc.user_id
    ORDER BY u.created_at DESC
    LIMIT 1;
    `;
    const findResult = await this.dataSource.query(findQuery);

    const userWithConfirmation = findResult[0];
    expect(userWithConfirmation).toBeDefined();
    expect(userWithConfirmation.confirmation_code).not.toBeNull();

    return userWithConfirmation.confirmation_code;
  }

  async setUserPasswordRecoveryCodeHash(
    userId: string,
    recoveryCodeHash: string,
  ): Promise<void> {
    const expirationDate = add(new Date(), { hours: 2 });

    const createOrUpdateQuery = `
    INSERT INTO password_recoveries
    (user_id, recovery_code_hash, expiration_date)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id)
    DO UPDATE SET
    recovery_code_hash = EXCLUDED.recovery_code_hash,
    expiration_date = EXCLUDED.expiration_date;
    `;
    await this.dataSource.query(createOrUpdateQuery, [
      +userId,
      recoveryCodeHash,
      expirationDate,
    ]);
  }

  async setUserPasswordRecoveryExpirationDate(
    userId: string,
    expirationDate: Date,
  ): Promise<void> {
    const updateQuery = `
    UPDATE password_recoveries
    SET expiration_date = $1
    WHERE user_id = $2;
    `;
    await this.dataSource.query(updateQuery, [expirationDate, +userId]);
  }
}
