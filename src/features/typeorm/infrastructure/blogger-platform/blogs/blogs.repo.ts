import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../../../entities/blogger-platform/blog.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BlogsRepo {
  constructor(
    @InjectRepository(Blog) private blogsRepository: Repository<Blog>,
  ) {}

  async save(blog: Blog): Promise<Blog> {
    return this.blogsRepository.save(blog);
  }

  async findById(id: number): Promise<Blog | null> {
    return this.blogsRepository.findOne({ where: { id } });
  }

  async findByIdOrNotFoundFail(id: number): Promise<Blog> {
    const blog = await this.findById(id);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return blog;
  }
}
