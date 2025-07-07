import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../domain/blog.entity';
import { Repository } from 'typeorm';
import { DomainException } from '../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-code';

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
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }

    return blog;
  }
}
