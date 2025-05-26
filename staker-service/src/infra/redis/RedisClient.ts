import Redis, { Pipeline } from "ioredis";

// --- Redis Client ---
export class RedisClient {
  private client: Redis;

  constructor(host: string = "localhost", port: number = 6379) {
    this.client = new Redis({ host, port });
    this.client.on("connect", () => console.log("Redis connected."));
    this.client.on("error", (err) =>
      console.log("Redis connection error:", err)
    );
  }

  async ping(): Promise<void> {
    try {
      const res = await this.client.ping();
      if (res !== "PONG") {
        throw new Error(`Unexpected ping response: ${res}`);
      }
      console.log("Redis ping successful.");
    } catch (err) {
      console.error("Redis ping failed:", err);
      throw err;
    }
  }
  pipeline(): Pipeline {
    return this.client.pipeline() as Pipeline;
  }

  async setLastProcessedBlock(blockNumber: number): Promise<void> {
    await this.client.set("sync:last_block", blockNumber);
  }
  async getLastProcessedBlock(): Promise<string> {
    const result = await this.client.get("sync:last_block");
    return result;
  }
  async setBalance(staker: string, amount: number): Promise<void> {
    await this.client.hset("staker_amounts", staker, amount);
  }

  async getBalance(staker: string): Promise<string | null> {
    return this.client.hget("staker_amounts", staker);
  }

  async removeStaker(staker: string): Promise<void> {
    await this.client.hdel("staker_amounts", staker);
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}
