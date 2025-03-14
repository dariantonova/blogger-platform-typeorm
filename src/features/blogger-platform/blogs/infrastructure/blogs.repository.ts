import { ObjectId } from 'mongodb';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Blog, BlogDocument, BlogModelType } from '../domain/blog.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}

  async findById(id: string): Promise<BlogDocument | null> {
    return this.BlogModel.findOne({
      _id: new ObjectId(id),
      deletedAt: null,
    });
  }

  async findByIdOrNotFoundFail(id: string): Promise<BlogDocument> {
    const blog = await this.findById(id);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return blog;
  }

  async findByIdOrInternalFail(id: string): Promise<BlogDocument> {
    const blog = await this.findById(id);

    if (!blog) {
      throw new Error('Blog not found');
    }

    return blog;
  }

  async save(blog: BlogDocument): Promise<void> {
    await blog.save();
  }
}
