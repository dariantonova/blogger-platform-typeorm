import {
  Check,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
@Check(`
  ("confirmationCode" IS NULL AND "expirationDate" IS NULL)
  OR
  ("confirmationCode" IS NOT NULL AND "expirationDate" IS NOT NULL)
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

  // static createInstance(
  //   dto: CreateUserConfirmationDomainDto,
  // ): UserConfirmation {
  //   const userConfirmation = new UserConfirmation();
  //
  //   userConfirmation.confirmationCode = dto.confirmationCode;
  //   userConfirmation.expirationDate = dto.expirationDate;
  //   userConfirmation.isConfirmed = dto.isConfirmed;
  //
  //   return userConfirmation;
  // }
  //
  // setConfirmationCode(code: string, codeLifetimeInSeconds: number) {
  //   this.confirmationCode = code;
  //   this.expirationDate = add(new Date(), {
  //     seconds: codeLifetimeInSeconds,
  //   });
  // }
  //
  // makeConfirmed() {
  //   this.isConfirmed = true;
  // }
}
