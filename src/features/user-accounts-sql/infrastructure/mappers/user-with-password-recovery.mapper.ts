import { UserWithPasswordRecoveryStrictDtoSql } from '../../dto/user-with-password-recovery-strict.dto';

export class UserWithPasswordRecoveryRowStrict {
  id: number;
  login: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
  recovery_code_hash: string;
  expiration_date: Date;
}

export const mapUserWithPasswordRecoveryRowToDtoStrict = (
  row: UserWithPasswordRecoveryRowStrict,
): UserWithPasswordRecoveryStrictDtoSql => {
  return {
    id: row.id,
    login: row.login,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    passwordRecoveryInfo: {
      recoveryCodeHash: row.recovery_code_hash,
      expirationDate: row.expiration_date,
    },
  };
};
