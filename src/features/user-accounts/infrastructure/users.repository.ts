import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FilterQuery } from 'mongoose';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}

  async save(user: UserDocument): Promise<void> {
    await user.save();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      _id: new ObjectId(id),
      deletedAt: null,
    });
  }

  async findByIdOrNotFoundFail(id: string): Promise<UserDocument> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByIdOrInternalFail(id: string): Promise<UserDocument> {
    const user = await this.findById(id);

    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    return user;
  }

  async findByLogin(login: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      login,
      deletedAt: null,
    });
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      email,
      deletedAt: null,
    });
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    const filter: FilterQuery<User> = {
      deletedAt: null,
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    };
    return this.UserModel.findOne(filter);
  }

  async findByConfirmationCode(
    confirmationCode: string,
  ): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      'confirmationInfo.confirmationCode': confirmationCode,
      deletedAt: null,
    });
  }

  async findByPasswordRecoveryCodeHash(
    recoveryCodeHash: string,
  ): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      'passwordRecoveryInfo.recoveryCodeHash': recoveryCodeHash,
      deletedAt: null,
    });
  }
}
