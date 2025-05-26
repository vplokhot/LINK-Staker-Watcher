import { Transfer } from "../../types";
import { PostgresClient } from "./PostgresClient";

export class TransferRepo {
  private db: PostgresClient;

  constructor(db: PostgresClient) {
    this.db = db;
  }

  async insert(event: Transfer): Promise<void> {
    const query = `
      INSERT INTO Transfers (
        transaction_hash,
        block_number,
        from_address,
        to_address,
        amount
      ) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (transaction_hash) DO NOTHING;
    `;

    const values = [
      event.transactionHash,
      event.blockNumber,
      event.from,
      event.to,
      event.amount,
    ];
    try {
      await this.db.query(query, values);
      console.log("Transfer inserted: ", values);
    } catch (e) {
      console.log("Error inserting transfer into repo: ", e);
      throw new Error(e);
    }
  }
  async insertMany(events: Transfer[]): Promise<void> {
    if (events.length === 0) return;

    const query = `
    INSERT INTO Transfers (
      transaction_hash,
      block_number,
      from_address,
      to_address,
      amount
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
        event.from,
        event.to,
        event.amount
      );
    }

    try {
      await this.db.query(query, values);
      console.log(`Inserted ${events.length} transfers.`);
    } catch (e) {
      console.error("Error inserting multiple transfers into repo:", e);
      throw new Error(e);
    }
  }

  // async getLastProcessedBlock(): Promise<number | null> {
  //   try {
  //     const result = await this.db.query<{ last_processed_block: number }>(
  //       `SELECT last_processed_block FROM sync_status WHERE id = 1`
  //     );
  //     return result.length > 0 ? result[0].last_processed_block : null;
  //   } catch (e) {
  //     console.error("Error getLastProcessedBlock:", e);
  //     throw new Error(e);
  //   }
  // }
  // async setLastProcessedBlock(block: number): Promise<void> {
  //   try {
  //     await this.db.query(
  //       `INSERT INTO sync_status (id, last_processed_block, updated_at)
  //        VALUES (1, $1, NOW())
  //        ON CONFLICT (id)
  //        DO UPDATE SET last_processed_block = $1, updated_at = NOW()`,
  //       [block]
  //     );
  //   } catch (e) {
  //     console.error("Error setLastProcessedBlock:", e);
  //     throw new Error(e);
  //   }
  // }
}
