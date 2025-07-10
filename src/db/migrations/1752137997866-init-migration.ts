import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitMigration1752137997866 implements MigrationInterface {
  name = 'InitMigration1752137997866';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "user_confirmations" ("confirmation_code" character varying, "expiration_date" TIMESTAMP WITH TIME ZONE, "is_confirmed" boolean NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "CHK_3719c92adfbf688d0a26b706fc" CHECK (
  ("confirmation_code" IS NULL AND "expiration_date" IS NULL)
  OR
  ("confirmation_code" IS NOT NULL AND "expiration_date" IS NOT NULL)
), CONSTRAINT "PK_0c10a648340b2f3d37efd84e912" PRIMARY KEY ("user_id"))`);
    await queryRunner.query(
      `CREATE TABLE "password_recoveries" ("recovery_code_hash" character varying NOT NULL, "expiration_date" TIMESTAMP WITH TIME ZONE NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_ee493797f4c3e9715d9b6fc8c82" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "login" character varying NOT NULL, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "device_auth_sessions" ("id" SERIAL NOT NULL, "device_id" uuid NOT NULL, "exp" TIMESTAMP WITH TIME ZONE NOT NULL, "iat" TIMESTAMP WITH TIME ZONE NOT NULL, "device_name" character varying NOT NULL, "ip" character varying NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "UQ_e00289c3f93858ffe583aff848b" UNIQUE ("user_id", "device_id"), CONSTRAINT "PK_41dcf2b4bdb0f05be4333e3105d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "blogs" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "description" character varying NOT NULL, "website_url" character varying NOT NULL, "is_membership" boolean NOT NULL, CONSTRAINT "PK_e113335f11c926da929a625f118" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "posts" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "title" character varying NOT NULL, "short_description" character varying NOT NULL, "content" character varying NOT NULL, "blog_id" integer NOT NULL, CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."post_likes_status_enum" AS ENUM('Like', 'Dislike', 'None')`,
    );
    await queryRunner.query(
      `CREATE TABLE "post_likes" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "status" "public"."post_likes_status_enum" NOT NULL, "post_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "UQ_8f64693922a9e8c4e2605850d0b" UNIQUE ("post_id", "user_id"), CONSTRAINT "PK_e4ac7cb9daf243939c6eabb2e0d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "comments" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "content" character varying NOT NULL, "post_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."comment_likes_status_enum" AS ENUM('Like', 'Dislike', 'None')`,
    );
    await queryRunner.query(
      `CREATE TABLE "comment_likes" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "status" "public"."comment_likes_status_enum" NOT NULL, "comment_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "UQ_660059072f131c773be5f37c475" UNIQUE ("comment_id", "user_id"), CONSTRAINT "PK_2c299aaf1f903c45ee7e6c7b419" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_confirmations" ADD CONSTRAINT "FK_0c10a648340b2f3d37efd84e912" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_recoveries" ADD CONSTRAINT "FK_ee493797f4c3e9715d9b6fc8c82" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_auth_sessions" ADD CONSTRAINT "FK_cd8a1829927825d7f4e253a83c8" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD CONSTRAINT "FK_7689491fe4377a8090576a799a0" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes" ADD CONSTRAINT "FK_b40d37469c501092203d285af80" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes" ADD CONSTRAINT "FK_9b9a7fc5eeff133cf71b8e06a7b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_259bf9825d9d198608d1b46b0b5" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_4c675567d2a58f0b07cef09c13d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_likes" ADD CONSTRAINT "FK_2073bf518ef7017ec19319a65e5" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_likes" ADD CONSTRAINT "FK_bdba9a10c64ff58d36b09e3ac45" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comment_likes" DROP CONSTRAINT "FK_bdba9a10c64ff58d36b09e3ac45"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_likes" DROP CONSTRAINT "FK_2073bf518ef7017ec19319a65e5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_4c675567d2a58f0b07cef09c13d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_259bf9825d9d198608d1b46b0b5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes" DROP CONSTRAINT "FK_9b9a7fc5eeff133cf71b8e06a7b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes" DROP CONSTRAINT "FK_b40d37469c501092203d285af80"`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" DROP CONSTRAINT "FK_7689491fe4377a8090576a799a0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "device_auth_sessions" DROP CONSTRAINT "FK_cd8a1829927825d7f4e253a83c8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "password_recoveries" DROP CONSTRAINT "FK_ee493797f4c3e9715d9b6fc8c82"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_confirmations" DROP CONSTRAINT "FK_0c10a648340b2f3d37efd84e912"`,
    );
    await queryRunner.query(`DROP TABLE "comment_likes"`);
    await queryRunner.query(`DROP TYPE "public"."comment_likes_status_enum"`);
    await queryRunner.query(`DROP TABLE "comments"`);
    await queryRunner.query(`DROP TABLE "post_likes"`);
    await queryRunner.query(`DROP TYPE "public"."post_likes_status_enum"`);
    await queryRunner.query(`DROP TABLE "posts"`);
    await queryRunner.query(`DROP TABLE "blogs"`);
    await queryRunner.query(`DROP TABLE "device_auth_sessions"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "password_recoveries"`);
    await queryRunner.query(`DROP TABLE "user_confirmations"`);
  }
}
