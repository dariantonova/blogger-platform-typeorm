import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Blog } from '../domain/blog.entity';
import { getValuesFromDtoToUpdate } from '../../../../common/utils/sql/get-values-from-dto-to-update';
import { buildUpdateSetClause } from '../../../../common/utils/sql/build-update-set-clause';

@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async save(blog: Blog): Promise<Blog> {
    if (!blog.id) {
      await this.createBlog(blog);
    } else {
      const { id, ...dtoToUpdate } = blog;
      await this.updateBlog(id, dtoToUpdate);
    }

    return blog;
  }

  async findById(id: number): Promise<Blog | null> {
    const findQuery = `
    ${this.buildSelectFromClause()}
    WHERE b.deleted_at IS NULL
    AND b.id = $1;
    `;
    const findResult = await this.dataSource.query(findQuery, [id]);

    return findResult[0] ? Blog.reconstitute(findResult[0]) : null;
  }

  async findByIdOrNotFoundFail(id: number): Promise<Blog> {
    const blog = await this.findById(id);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return blog;
  }

  private buildSelectFromClause(): string {
    return `
    SELECT
    b.id, b.name, b.description, b.website_url, b.is_membership, b.created_at, b.updated_at, b.deleted_at
    FROM blogs b
    `;
  }

  private async createBlog(blog: Blog): Promise<void> {
    const createQuery = `
    INSERT INTO blogs
    (name, description, website_url, is_membership, created_at, updated_at, deleted_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id;
    `;
    const createResult = await this.dataSource.query(createQuery, [
      blog.name,
      blog.description,
      blog.websiteUrl,
      blog.isMembership,
      blog.createdAt,
      blog.updatedAt,
      blog.deletedAt,
    ]);

    blog.id = createResult[0].id;
  }

  private async updateBlog(
    id: number,
    dtoToUpdate: Partial<Blog>,
  ): Promise<void> {
    const newValues = getValuesFromDtoToUpdate(dtoToUpdate);
    const updateSetClause = buildUpdateSetClause(dtoToUpdate);

    const updateQuery = `
    UPDATE blogs
    ${updateSetClause}
    WHERE id = $${newValues.length + 1};
    `;
    await this.dataSource.query(updateQuery, [...newValues, id]);
  }
}
