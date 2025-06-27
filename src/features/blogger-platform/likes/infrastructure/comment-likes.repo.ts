import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { CommentLike } from '../domain/comment-like.entity';
import { DataSource, In, IsNull, Repository } from 'typeorm';
import { Comment } from '../../comments/domain/comment.entity';

@Injectable()
export class CommentLikesRepo {
  constructor(
    @InjectRepository(CommentLike)
    private commentLikesRepository: Repository<CommentLike>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async save(commentLike: CommentLike): Promise<CommentLike> {
    return this.commentLikesRepository.save(commentLike);
  }

  async findByUserAndComment(
    userId: number,
    commentId: number,
  ): Promise<CommentLike | null> {
    return this.commentLikesRepository.findOne({
      where: { userId, commentId },
    });
  }

  async softDeleteLikesOfCommentsWithBlogId(blogId: number): Promise<void> {
    const commentsOfBlog = await this.dataSource
      .createQueryBuilder()
      .select('c.id as id')
      .from(Comment, 'c')
      .leftJoin('c.post', 'p')
      .where('p.blog_id = :blogId', { blogId })
      .getRawMany<{ id: number }>();
    const commentIds = commentsOfBlog.map((c) => c.id);

    await this.commentLikesRepository.softDelete({
      commentId: In(commentIds),
      deletedAt: IsNull(),
    });
  }

  async softDeleteLikesOfCommentsWithPostId(postId: number): Promise<void> {
    const commentsOfPost = await this.dataSource
      .createQueryBuilder()
      .select('c.id as id')
      .from(Comment, 'c')
      .where('c.post_id = :postId', { postId })
      .getRawMany<{ id: number }>();
    const commentIds = commentsOfPost.map((c) => c.id);

    await this.commentLikesRepository.softDelete({
      commentId: In(commentIds),
      deletedAt: IsNull(),
    });
  }

  async softDeleteByCommentId(commentId: number): Promise<void> {
    await this.commentLikesRepository.softDelete({
      commentId,
      deletedAt: IsNull(),
    });
  }

  async softDeleteByUserId(userId: number): Promise<void> {
    await this.commentLikesRepository.softDelete({
      userId,
      deletedAt: IsNull(),
    });
  }

  async softDeleteLikesOfCommentsWithUserId(userId: number): Promise<void> {
    const commentsOfUser = await this.dataSource
      .createQueryBuilder()
      .select('c.id as id')
      .from(Comment, 'c')
      .where('c.user_id = :userId', { userId })
      .getRawMany<{ id: number }>();
    const commentIds = commentsOfUser.map((c) => c.id);

    await this.commentLikesRepository.softDelete({
      commentId: In(commentIds),
      deletedAt: IsNull(),
    });
  }
}
