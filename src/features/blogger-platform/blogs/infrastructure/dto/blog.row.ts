export class BlogRow {
  id: number;
  name: string;
  description: string;
  website_url: string;
  is_membership: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
