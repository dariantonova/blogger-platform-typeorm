import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostWrap } from '../domain/post.wrap';
import { getValuesFromDtoToUpdate } from '../../../wrap/utils/get-values-from-dto-to-update';
import { buildUpdateSetClause } from '../../../wrap/utils/build-update-set-clause';

@Injectable()
export class PostsRepositoryWrap {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async save(post: PostWrap): Promise<PostWrap> {
    if (!post.id) {
      await this.createPost(post);
    } else {
      const { id, ...dtoToUpdate } = post;
      await this.updatePost(id, dtoToUpdate);
    }

    return post;
  }

  async findById(id: number): Promise<PostWrap | null> {
    const findQuery = `
    ${this.buildSelectFromClause()}
    WHERE p.deleted_at IS NULL
    AND p.id = $1;
    `;
    const findResult = await this.dataSource.query(findQuery, [id]);

    return findResult[0] ? PostWrap.reconstitute(findResult[0]) : null;
  }

  async findByIdAndBlogId(
    id: number,
    blogId: number,
  ): Promise<PostWrap | null> {
    const findQuery = `
    ${this.buildSelectFromClause()}
    WHERE p.deleted_at IS NULL
    AND p.id = $1
    AND p.blog_id = $2;
    `;
    const findResult = await this.dataSource.query(findQuery, [id, blogId]);

    return findResult[0] ? PostWrap.reconstitute(findResult[0]) : null;
  }

  async findByIdOrNotFoundFail(id: number): Promise<PostWrap> {
    const post = await this.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async findByIdAndBlogIdOrNotFoundFail(
    id: number,
    blogId: number,
  ): Promise<PostWrap> {
    const post = await this.findByIdAndBlogId(id, blogId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async softDeleteByBlogId(blogId: number): Promise<void> {
    const updateQuery = `
    UPDATE posts
    SET deleted_at = now()
    WHERE deleted_at IS NULL
    AND blog_id = $1;
    `;
    await this.dataSource.query(updateQuery, [blogId]);
  }

  private buildSelectFromClause(): string {
    return `
    SELECT
    p.id, p.title, p.short_description, p.content, p.blog_id, p.created_at, p.updated_at, p.deleted_at
    FROM posts p
    `;
  }

  private async createPost(post: PostWrap): Promise<void> {
    const createQuery = `
    INSERT INTO posts
    (title, short_description, content, blog_id, created_at, updated_at, deleted_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id;
    `;
    const createResult = await this.dataSource.query(createQuery, [
      post.title,
      post.shortDescription,
      post.content,
      post.blogId,
      post.createdAt,
      post.updatedAt,
      post.deletedAt,
    ]);

    post.id = createResult[0].id;
  }

  private async updatePost(
    id: number,
    dtoToUpdate: Partial<PostWrap>,
  ): Promise<void> {
    const newValues = getValuesFromDtoToUpdate(dtoToUpdate);
    const updateSetClause = buildUpdateSetClause(dtoToUpdate);

    const updateQuery = `
    UPDATE posts
    ${updateSetClause}
    WHERE id = $${newValues.length + 1};
    `;
    await this.dataSource.query(updateQuery, [...newValues, id]);
  }
}
