import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class PasswordRecovery {
  @Column()
  recoveryCodeHash: string;

  @Column({ type: 'timestamp with time zone' })
  expirationDate: Date;

  @OneToOne(() => User, (u) => u.passwordRecoveryInfo)
  @JoinColumn()
  user: User;

  @PrimaryColumn()
  userId: number;

  // static createInstance(
  //   dto: CreatePasswordRecoveryDomainDto,
  // ): PasswordRecovery {
  //   const passwordRecovery = new PasswordRecovery();
  //
  //   passwordRecovery.setRecoveryCodeHash(
  //     dto.recoveryCodeHash,
  //     dto.recoveryCodeLifetimeInSeconds,
  //   );
  //
  //   return passwordRecovery;
  // }
  //
  // setRecoveryCodeHash(codeHash: string, codeLifetimeInSeconds: number) {
  //   this.recoveryCodeHash = codeHash;
  //   this.expirationDate = add(new Date(), {
  //     seconds: codeLifetimeInSeconds,
  //   });
  // }
}
