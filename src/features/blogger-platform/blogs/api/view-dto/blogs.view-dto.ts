import { Blog } from '../../domain/blog.entity';

export class BlogViewDto {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;

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
