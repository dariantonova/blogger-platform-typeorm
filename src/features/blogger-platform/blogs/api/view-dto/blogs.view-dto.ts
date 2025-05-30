import { BlogDocument } from '../../domain/blog.entity';
import { BlogDtoSql } from '../../../../blogger-platform-sql/blogs/dto/blog.dto.sql';

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
}
