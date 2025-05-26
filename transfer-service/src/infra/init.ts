import { PostgresClient } from "./db/PostgresClient";
import { TransferRepo } from "./db/TransferRepo";
import { RedisClient } from "./redis/RedisClient";
import { provider } from "./rpc";

export async function initializeInfrastructure() {
  try {
    const db = new PostgresClient({
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    });

    await db.connect();
    const repo = new TransferRepo(db);

    const redis = new RedisClient(
      process.env.REDIS_HOST,
      Number(process.env.REDIS_PORT)
    );

    await redis.ping();

    // return { db, eventRepo, redis, provider };
    return { db, repo, redis, provider };
  } catch (e) {
    console.log(e, "Error initializing infrastructure");
    throw new Error("Unable to initialize infrastructure");
  }
}
