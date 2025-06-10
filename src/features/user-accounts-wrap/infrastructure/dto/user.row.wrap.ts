export class UserRowWrap {
  id: number;
  login: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  confirmation_code: string | null;
  confirmation_expiration_date: Date | null;
  is_confirmed: boolean;
  password_recovery_code_hash: string | null;
  password_recovery_expiration_date: Date | null;
}
