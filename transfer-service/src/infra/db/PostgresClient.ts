import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

interface DBConfig {
  host: string;
  database: string;
  port: number;
  user: string;
  password: string;
}

export class PostgresClient {
  private pool: Pool;

  constructor(config: DBConfig) {
    this.pool = new Pool(config);
  }

  async connect(): Promise<void> {
    try {
      await this.pool.connect();
      console.log("Connected to Postgres");
    } catch (err) {
      console.error("Failed to connect to Postgres:", err);
      throw err;
    }
  }

  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const res = await this.pool.query(text, params);
    return res.rows;
  }

  async end(): Promise<void> {
    await this.pool.end();
    console.log("Disconnected from Postgres");
  }

  getPool(): Pool {
    return this.pool;
  }
}
