import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOutboxTable1774290105796 implements MigrationInterface {
  name = 'CreateOutboxTable1774290105796';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "outbox" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" text NOT NULL, "payload_json" jsonb NOT NULL, "metadata" jsonb, "status" text NOT NULL DEFAULT 'PENDING', "attempts" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "processed_at" TIMESTAMP WITH TIME ZONE, "claimed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_340ab539f309f03bdaa14aa7649" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_3b0168150d9a3681fd4542c428" ON "outbox" ("status", "created_at") WHERE "status" = 'PENDING'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3b0168150d9a3681fd4542c428"`,
    );

    await queryRunner.query(`DROP TABLE "outbox"`);
  }
}
