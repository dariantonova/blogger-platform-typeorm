import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findByIdOrNotFoundFail(id: string): Promise<UserDocument> {
    const user = await this.UserModel.findOne({
      _id: new ObjectId(id),
      deletedAt: null,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findUserByLogin(login: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      login,
      deletedAt: null,
    });
  }

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      email,
      deletedAt: null,
    });
  }

  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserDocument | null> {
    const filter: FilterQuery<User> = {
      deletedAt: null,
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    };
    return this.UserModel.findOne(filter);
  }
}
