import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async softDeleteByBlogId(blogId: number): Promise<void> {
    const updateQuery = `
    UPDATE posts
    SET deleted_at = now()
    WHERE deleted_at IS NULL
    AND blog_id = $1;
    `;
    await this.dataSource.query(updateQuery, [blogId]);
  }
}
