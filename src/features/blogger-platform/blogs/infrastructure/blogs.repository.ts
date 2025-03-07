import { ObjectId } from 'mongodb';
import { NotFoundException } from '@nestjs/common';
import { Blog, BlogDocument, BlogModelType } from '../domain/blog.entity';
import { InjectModel } from '@nestjs/mongoose';

export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}

  async findBlogByIdOrNotFoundFail(id: string): Promise<BlogDocument> {
    const blog = await this.BlogModel.findOne({
      _id: new ObjectId(id),
      deletedAt: null,
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return blog;
  }

  async save(blog: BlogDocument): Promise<void> {
    await blog.save();
  }
}
