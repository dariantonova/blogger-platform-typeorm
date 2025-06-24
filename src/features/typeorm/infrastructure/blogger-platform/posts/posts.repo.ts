import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../../../entities/blogger-platform/post.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PostsRepo {
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
  ) {}

  async save(post: Post): Promise<Post> {
    return this.postsRepository.save(post);
  }

  async findById(id: number): Promise<Post | null> {
    return this.postsRepository.findOne({ where: { id } });
  }

  async findByIdAndBlogId(id: number, blogId: number): Promise<Post | null> {
    return this.postsRepository.findOne({ where: { id, blogId } });
  }

  async findByIdOrNotFoundFail(id: number): Promise<Post> {
    const post = await this.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async findByIdAndBlogIdOrNotFoundFail(
    id: number,
    blogId: number,
  ): Promise<Post> {
    const post = await this.findByIdAndBlogId(id, blogId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async softDeleteByBlogId(blogId: number): Promise<void> {
    await this.postsRepository.softDelete({ blogId });
  }
}
