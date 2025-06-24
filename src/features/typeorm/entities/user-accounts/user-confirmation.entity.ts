import {
  Check,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from './user.entity';
import { CreateUserConfirmationDomainDtoTypeorm } from './dto/create-user-confirmation.domain-dto.typeorm';
import { add } from 'date-fns';

@Entity({ name: 'user_confirmations' })
@Check(`
  ("confirmation_code" IS NULL AND "expiration_date" IS NULL)
  OR
  ("confirmation_code" IS NOT NULL AND "expiration_date" IS NOT NULL)
`)
export class UserConfirmation {
  @Column({ nullable: true, type: 'varchar' })
  confirmationCode: string | null;

  @Column({ nullable: true, type: 'timestamp with time zone' })
  expirationDate: Date | null;

  @Column()
  isConfirmed: boolean;

  @OneToOne(() => User, (u) => u.confirmationInfo)
  @JoinColumn()
  user: User;

  @PrimaryColumn()
  userId: number;

  static createInstance(
    dto: CreateUserConfirmationDomainDtoTypeorm,
  ): UserConfirmation {
    const userConfirmation = new UserConfirmation();

    userConfirmation.confirmationCode = dto.confirmationCode;
    userConfirmation.expirationDate = dto.expirationDate;
    userConfirmation.isConfirmed = dto.isConfirmed;
    userConfirmation.user = dto.user;

    return userConfirmation;
  }

  setConfirmationCode(code: string, codeLifetimeInSeconds: number) {
    this.confirmationCode = code;
    this.expirationDate = add(new Date(), {
      seconds: codeLifetimeInSeconds,
    });
  }

  makeConfirmed() {
    this.isConfirmed = true;
  }
}
