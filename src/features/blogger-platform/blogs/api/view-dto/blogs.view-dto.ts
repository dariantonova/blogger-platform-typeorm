import { BlogViewRow } from '../../infrastructure/query/dto/blog.view-row';
import { Blog } from '../../../../typeorm/entities/blogger-platform/blog.entity';

export class BlogViewDto {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;

  static mapToView(row: BlogViewRow): BlogViewDto {
    const dto = new BlogViewDto();

    dto.id = row.id.toString();
    dto.name = row.name;
    dto.description = row.description;
    dto.websiteUrl = row.website_url;
    dto.createdAt = row.created_at.toISOString();
    dto.isMembership = row.is_membership;

    return dto;
  }

  static mapToViewEntity(entity: Blog): BlogViewDto {
    const dto = new BlogViewDto();

    dto.id = entity.id.toString();
    dto.name = entity.name;
    dto.description = entity.description;
    dto.websiteUrl = entity.websiteUrl;
    dto.createdAt = entity.createdAt.toISOString();
    dto.isMembership = entity.isMembership;

    return dto;
  }
}
