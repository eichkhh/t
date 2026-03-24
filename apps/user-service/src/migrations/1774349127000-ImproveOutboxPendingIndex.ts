import { MigrationInterface, QueryRunner } from 'typeorm';

export class ImproveOutboxPendingIndex1774349127000 implements MigrationInterface {
  name = 'ImproveOutboxPendingIndex1774349127000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_3b0168150d9a3681fd4542c428"`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_outbox_pending_created_at"
       ON "outbox" ("created_at")
       INCLUDE (attempts)
       WHERE "status" = 'PENDING'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_outbox_pending_created_at"`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_3b0168150d9a3681fd4542c428"
       ON "outbox" ("status", "created_at")
       WHERE "status" = 'PENDING'`,
    );
  }
}
