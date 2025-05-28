import { ExtendedLikesInfoDtoSql } from '../../common/dto/extended-likes-info.dto.sql';

export class PostDtoSql {
  id: number;
  title: string;
  shortDescription: string;
  content: string;
  blogId: number;
  blogName: string;
  extendedLikesInfo: ExtendedLikesInfoDtoSql;
  createdAt: Date;
  updatedAt: Date;
}
