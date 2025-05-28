import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateBlogRepoDto } from './dto/create-blog.repo-dto';
import { BlogDtoSql } from '../dto/blog.dto.sql';
import { mapBlogRowToDto } from './mappers/blog.mapper';
import { UpdateBlogRepoDto } from './dto/update-blog.repo-dto';

@Injectable()
export class BlogsRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createBlog(dto: CreateBlogRepoDto): Promise<number> {
    const createQuery = `
    INSERT INTO blogs
    (name, description, website_url, is_membership)
    VALUES ($1, $2, $3, $4)
    RETURNING id;
    `;
    const createResult = await this.dataSource.query(createQuery, [
      dto.name,
      dto.description,
      dto.websiteUrl,
      dto.isMembership,
    ]);

    return createResult[0].id;
  }

  async findById(id: number): Promise<BlogDtoSql | null> {
    const findQuery = `
    SELECT
    b.id, b.name, b.description, b.website_url, b.is_membership, b.created_at, b.updated_at
    FROM blogs b
    WHERE b.id = $1
    AND b.deleted_at IS NULL;
    `;
    const findResult = await this.dataSource.query(findQuery, [id]);

    return findResult[0] ? mapBlogRowToDto(findResult[0]) : null;
  }

  async findByIdOrNotFoundFail(id: number): Promise<BlogDtoSql> {
    const blog = await this.findById(id);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return blog;
  }

  async updateBlog(id: number, dto: UpdateBlogRepoDto): Promise<void> {
    const updateQuery = `
    UPDATE blogs
    SET name = $1,
        description = $2,
        website_url = $3,
        updated_at = now()
    WHERE id = $4;
    `;
    await this.dataSource.query(updateQuery, [
      dto.name,
      dto.description,
      dto.websiteUrl,
      id,
    ]);
  }

  async softDeleteById(id: number): Promise<void> {
    const updateQuery = `
    UPDATE blogs
    SET deleted_at = now()
    WHERE deleted_at IS NULL
    AND id = $1;
    `;
    await this.dataSource.query(updateQuery, [id]);
  }
}
