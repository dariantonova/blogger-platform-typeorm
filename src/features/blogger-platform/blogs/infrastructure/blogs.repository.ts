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

  async findBlogById(id: string): Promise<BlogDocument | null> {
    return this.BlogModel.findOne({
      _id: new ObjectId(id),
      deletedAt: null,
    });
  }

  async findBlogByIdOrNotFoundFail(id: string): Promise<BlogDocument> {
    const blog = await this.findBlogById(id);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return blog;
  }

  async findBlogByIdOrInternalFail(id: string): Promise<BlogDocument> {
    const blog = await this.findBlogById(id);

    if (!blog) {
      throw new Error('Blog not found');
    }

    return blog;
  }

  async save(blog: BlogDocument): Promise<void> {
    await blog.save();
  }
}
