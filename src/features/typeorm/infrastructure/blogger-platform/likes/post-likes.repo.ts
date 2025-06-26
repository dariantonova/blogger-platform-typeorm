import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { PostLike } from '../../../entities/blogger-platform/post-like.entity';
import { DataSource, In, IsNull, Repository } from 'typeorm';
import { Post } from '../../../entities/blogger-platform/post.entity';

@Injectable()
export class PostLikesRepo {
  constructor(
    @InjectRepository(PostLike)
    private postLikesRepository: Repository<PostLike>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async save(postLike: PostLike): Promise<PostLike> {
    return this.postLikesRepository.save(postLike);
  }

  async findByUserAndPost(
    userId: number,
    postId: number,
  ): Promise<PostLike | null> {
    return this.postLikesRepository.findOne({ where: { userId, postId } });
  }

  async softDeleteLikesOfPostsWithBlogId(blogId: number): Promise<void> {
    const postsOfBlog = await this.dataSource
      .createQueryBuilder()
      .select('p.id as id')
      .from(Post, 'p')
      .where('p.blog_id = :blogId', { blogId })
      .getRawMany<{ id: number }>();
    const postIds = postsOfBlog.map((p) => p.id);

    await this.postLikesRepository.softDelete({
      postId: In(postIds),
      deletedAt: IsNull(),
    });
  }

  async softDeleteByPostId(postId: number): Promise<void> {
    await this.postLikesRepository.softDelete({
      postId,
      deletedAt: IsNull(),
    });
  }

  async softDeleteByUserId(userId: number): Promise<void> {
    await this.postLikesRepository.softDelete({
      userId,
      deletedAt: IsNull(),
    });
  }
}
