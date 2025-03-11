import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}

  async save(user: UserDocument): Promise<void> {
    await user.save();
  }

  async findUserByIdOrNotFoundFail(id: string): Promise<UserDocument> {
    const user = await this.UserModel.findOne({
      _id: new ObjectId(id),
      deletedAt: null,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
