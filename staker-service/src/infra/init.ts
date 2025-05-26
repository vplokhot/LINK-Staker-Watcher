import { PostgresClient } from "./db/PostgresClient";
import { EventRepo } from "./db/EventRepo";
import { RedisClient } from "./redis/RedisClient";
import { createRpcProviders } from "./ethereum";

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
    const eventRepo = new EventRepo(db);

    const redis = new RedisClient(
      process.env.REDIS_HOST,
      Number(process.env.REDIS_PORT)
    );

    await redis.ping();

    const { provider, socketProvider } = await createRpcProviders();

    return { db, eventRepo, redis, provider, socketProvider };
  } catch (e) {
    console.log(e, "Error initializing infrastructure");
    throw new Error("Unable to initialize infrastructure");
  }
}
