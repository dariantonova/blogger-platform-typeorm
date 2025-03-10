import { Post, PostDocument, PostModelType } from '../domain/post.entity';
import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';

export class PostsRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
  ) {}

  async save(post: PostDocument): Promise<void> {
    await post.save();
  }

  async findPostById(id: string): Promise<PostDocument | null> {
    return this.PostModel.findOne({
      _id: new ObjectId(id),
      deletedAt: null,
    });
  }

  async findPostByIdOrNotFoundFail(id: string): Promise<PostDocument> {
    const post = await this.findPostById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }
}
