import { CONTRACT_DEPLOYMENT_BLOCK } from "../config/constants";
import { TransferRepo } from "../infra/db/TransferRepo";
import { RedisClient } from "../infra/redis/RedisClient";
// export async function resolveStartBlock(
//   eventRepo: TransferRepo,
//   redis: RedisClient
// ): Promise<number> {
//   try {
//     const redisBlock = await redis.getLastProcessedBlock();
//     // Redis should be used as the latest source of truth
//     // If Redis doesn't have it, use DB
//     if (redisBlock) {
//       console.log("Using start block from Redis.");
//       return parseInt(redisBlock, 10);
//     }

//     // const dbBlock = await eventRepo.getLastProcessedBlock();

//     if (dbBlock !== null) {
//       console.log("Using start block from db.");
//       await redis.setLastProcessedBlock(dbBlock);
//       return dbBlock;
//     }
//     // start from the very beginning
//     console.log("Using contract deployment block");
//     await redis.setLastProcessedBlock(CONTRACT_DEPLOYMENT_BLOCK);
//     return CONTRACT_DEPLOYMENT_BLOCK;
//   } catch (e) {
//     console.log(e, "Error determining start block.");
//     throw new Error("Unable to resolve start block");
//   }
// }
