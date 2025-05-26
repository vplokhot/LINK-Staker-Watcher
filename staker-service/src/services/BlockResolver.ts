import { CONTRACT_DEPLOYMENT_BLOCK } from "../config/constants";
import { EventRepo } from "../infra/db/EventRepo";
import { RedisClient } from "../infra/redis/RedisClient";

// Determines the block to begin syncing from.
// Prefers Redis as source of truth, falls back to DB, or contract deployment block.
export async function resolveStartBlock(
  eventRepo: EventRepo,
  redis: RedisClient
): Promise<number> {
  try {
    const redisBlock = await redis.getLastProcessedBlock();

    if (redisBlock) {
      console.log("Using start block from Redis.");
      return parseInt(redisBlock, 10);
    }

    const dbBlock = await eventRepo.getLastProcessedBlock();

    if (dbBlock !== null) {
      console.log("Using start block from db.");
      await redis.setLastProcessedBlock(dbBlock);
      return dbBlock;
    }
    console.log("Using contract deployment block");
    await redis.setLastProcessedBlock(CONTRACT_DEPLOYMENT_BLOCK);
    return CONTRACT_DEPLOYMENT_BLOCK;
  } catch (e) {
    console.log(e, "Error determining start block.");
    throw new Error("Unable to resolve start block");
  }
}
