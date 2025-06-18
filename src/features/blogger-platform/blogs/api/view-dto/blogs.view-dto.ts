import { BlogViewRow } from '../../infrastructure/query/dto/blog.view-row';

export class BlogViewDto {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;

  static mapToViewWrap(row: BlogViewRow): BlogViewDto {
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
