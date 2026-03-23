export interface OutboxRow {
  id: string;
  type: string;
  payloadJson: unknown;
  metadata: Record<string, unknown> | null;
}
