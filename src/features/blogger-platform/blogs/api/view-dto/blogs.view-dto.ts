import { BlogDocument } from '../../domain/blog.entity';
import { BlogDtoSql } from '../../../../blogger-platform-sql/blogs/dto/blog.dto.sql';
import { BlogViewRowWrap } from '../../../../blogger-platform-wrap/blogs/infrastructure/query/dto/blog.view-row.wrap';

export class BlogViewDto {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;

  static mapToView(blog: BlogDtoSql): BlogViewDto {
    const dto = new BlogViewDto();

    dto.id = blog.id.toString();
    dto.name = blog.name;
    dto.description = blog.description;
    dto.websiteUrl = blog.websiteUrl;
    dto.createdAt = blog.createdAt.toISOString();
    dto.isMembership = blog.isMembership;

    return dto;
  }

  static mapToViewMongo(blog: BlogDocument): BlogViewDto {
    const dto = new BlogViewDto();

    dto.id = blog._id.toString();
    dto.name = blog.name;
    dto.description = blog.description;
    dto.websiteUrl = blog.websiteUrl;
    dto.createdAt = blog.createdAt.toISOString();
    dto.isMembership = blog.isMembership;

    return dto;
  }

  static mapToViewWrap(row: BlogViewRowWrap): BlogViewDto {
    const dto = new BlogViewDto();

    dto.id = row.id.toString();
    dto.name = row.name;
    dto.description = row.description;
    dto.websiteUrl = row.website_url;
    dto.createdAt = row.created_at.toISOString();
    dto.isMembership = row.is_membership;

    return dto;
  }
}
