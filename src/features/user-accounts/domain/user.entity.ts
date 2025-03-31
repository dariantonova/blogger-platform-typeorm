import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  ConfirmationInfo,
  ConfirmationInfoSchema,
} from './confirmation-info.schema';
import {
  PasswordRecoveryInfo,
  PasswordRecoveryInfoSchema,
} from './password-recovery-info.schema';
import { HydratedDocument, Model } from 'mongoose';
import { CreateUserDomainDto } from './dto/create-user.domain.dto';
import { add } from 'date-fns';

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
  match: /^[a-zA-Z0-9_-]*$/,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

export const emailConstraints = {
  match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
};

const confirmationCodeLifetime = { hours: 2 };

@Schema({ timestamps: true })
export class User {
  @Prop({
    type: String,
    required: true,
    unique: true,
    ...loginConstraints,
  })
  login: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    ...emailConstraints,
  })
  email: string;

  @Prop({
    type: String,
    required: true,
  })
  passwordHash: string;

  createdAt: Date;
  updatedAt: Date;

  @Prop({
    type: ConfirmationInfoSchema,
  })
  confirmationInfo: ConfirmationInfo;

  @Prop({
    type: PasswordRecoveryInfoSchema,
  })
  passwordRecoveryInfo: PasswordRecoveryInfo;

  @Prop({
    type: Date,
    nullable: true,
    default: null,
  })
  deletedAt: Date | null;

  static createInstance(dto: CreateUserDomainDto): UserDocument {
    const user = new this();

    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    user.confirmationInfo = {
      confirmationCode: '',
      expirationDate: new Date(),
      isConfirmed: false,
    };
    user.passwordRecoveryInfo = {
      recoveryCodeHash: '',
      expirationDate: new Date(),
    };
    user.deletedAt = null;

    return user as UserDocument;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('User is already deleted');
    }
    this.deletedAt = new Date();
  }

  setConfirmationCode(code: string) {
    this.confirmationInfo.confirmationCode = code;
    this.confirmationInfo.expirationDate = add(
      new Date(),
      confirmationCodeLifetime,
    );
  }

  makeConfirmed() {
    this.confirmationInfo.isConfirmed = true;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.loadClass(User);

export type UserDocument = HydratedDocument<User>;

export type UserModelType = Model<UserDocument> & typeof User;
