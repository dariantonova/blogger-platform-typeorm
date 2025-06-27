import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../domain/comment.entity';
import { DataSource, In, IsNull, Repository } from 'typeorm';
import { Post } from '../../posts/domain/post.entity';

@Injectable()
export class CommentsRepo {
  constructor(
    @InjectRepository(Comment) private commentsRepository: Repository<Comment>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async save(comment: Comment): Promise<Comment> {
    return this.commentsRepository.save(comment);
  }

  async findById(id: number): Promise<Comment | null> {
    return this.commentsRepository.findOne({ where: { id } });
  }

  async findByIdOrNotFoundFail(id: number): Promise<Comment> {
    const comment = await this.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async softDeleteCommentsOfPostsWithBlogId(blogId: number): Promise<void> {
    const postsOfBlog = await this.dataSource
      .createQueryBuilder()
      .select('p.id as id')
      .from(Post, 'p')
      .where('p.blog_id = :blogId', { blogId })
      .getRawMany<{ id: number }>();
    const postIds = postsOfBlog.map((p) => p.id);

    await this.commentsRepository.softDelete({
      postId: In(postIds),
      deletedAt: IsNull(),
    });
  }

  async softDeleteByPostId(postId: number): Promise<void> {
    await this.commentsRepository.softDelete({ postId, deletedAt: IsNull() });
  }

  async softDeleteByUserId(userId: number): Promise<void> {
    await this.commentsRepository.softDelete({ userId, deletedAt: IsNull() });
  }
}
