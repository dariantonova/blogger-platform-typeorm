import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../../domain/user.entity';
import { ObjectId } from 'mongodb';
import { UserExternalDto } from './external-dto/users.external-dto';

@Injectable()
export class UsersExternalQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  private async findById(id: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      _id: new ObjectId(id),
      deletedAt: null,
    });
  }

  async findByIdOrInternalFail(id: string): Promise<UserExternalDto> {
    const user = await this.findById(id);

    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    return UserExternalDto.mapToView(user);
  }
}
