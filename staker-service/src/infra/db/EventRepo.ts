import { Event } from "../../types";
import { PostgresClient } from "./PostgresClient";

export class EventRepo {
  private db: PostgresClient;

  constructor(db: PostgresClient) {
    this.db = db;
  }

  async insert(event: Event): Promise<void> {
    const query = `
      INSERT INTO Events (
        transaction_hash,
        block_number,
        actor,
        amount,
        event_name
      ) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (transaction_hash) DO NOTHING;
    `;

    const values = [
      event.transactionHash,
      event.blockNumber,
      event.actor,
      event.amount,
      event.eventName,
    ];
    try {
      await this.db.query(query, values);
      console.log("Event inserted: ", values);
    } catch (e) {
      console.log("Error inserting event into repo: ", e);
      throw new Error(e);
    }
  }
  async insertMany(events: Event[]): Promise<void> {
    if (events.length === 0) return;

    const query = `
    INSERT INTO Events (
      transaction_hash,
      block_number,
      actor,
      amount,
      event_name
    ) VALUES ${events
      .map(
        (_, i) =>
          `($${i * 5 + 1}, $${i * 5 + 2}, $${i * 5 + 3}, $${i * 5 + 4}, $${
            i * 5 + 5
          })`
      )
      .join(", ")}
    ON CONFLICT (transaction_hash) DO NOTHING;
  `;

    const values: any[] = [];
    for (const event of events) {
      values.push(
        event.transactionHash,
        event.blockNumber,
        event.actor,
        event.amount,
        event.eventName
      );
    }

    try {
      await this.db.query(query, values);
      console.log(`Inserted ${events.length} events.`);
    } catch (e) {
      console.error("Error inserting multiple events into repo:", e);
      throw new Error(e);
    }
  }

  async getLastProcessedBlock(): Promise<number | null> {
    try {
      const result = await this.db.query<{ last_processed_block: number }>(
        `SELECT last_processed_block FROM sync_status WHERE id = 1`
      );
      return result.length > 0 ? result[0].last_processed_block : null;
    } catch (e) {
      console.error("Error getLastProcessedBlock:", e);
      throw new Error(e);
    }
  }
  async setLastProcessedBlock(block: number): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO sync_status (id, last_processed_block, updated_at)
         VALUES (1, $1, NOW())
         ON CONFLICT (id)
         DO UPDATE SET last_processed_block = $1, updated_at = NOW()`,
        [block]
      );
    } catch (e) {
      console.error("Error setLastProcessedBlock:", e);
      throw new Error(e);
    }
  }
}
