import type { RedisClient } from "../infra/redis/RedisClient";
import { Transfer } from "../types";

export class Accountant {
  private redis: RedisClient;
  constructor(_redis: RedisClient) {
    this.redis = _redis;
  }

  // async processEvent(event: Transfer): Promise<void> {
  //   try {
  //     const { eventName, actor, amount } = event;

  //     const currentBalance = (await this.redis.getBalance(actor)) || 0;
  //     let actorBalance = currentBalance ? parseInt(currentBalance) : 0;

  //     if (eventName === "Stake") {
  //       actorBalance += amount;
  //     } else if (eventName === "Unstake") {
  //       actorBalance -= amount;
  //       if (actorBalance < 0) actorBalance = 0; // Optional guard
  //     }

  //     if (actorBalance === 0) {
  //       await this.redis.removeStaker(actor);
  //     } else {
  //       await this.redis.setBalance(actor, actorBalance);
  //     }
  //   } catch (e) {
  //     console.log(e, "Error processing event");
  //     throw new Error(e);
  //   }
  // }
  // async processBatch(events: Event[]): Promise<void> {
  //   try {
  //     const pipeline = this.redis.pipeline();

  //     for (let event of events) {
  //       const { eventName, actor, amount } = event;

  //       const currentBalance = (await this.redis.getBalance(actor)) || 0;
  //       let actorBalance = currentBalance ? parseInt(currentBalance) : 0;

  //       if (eventName === "Staked") {
  //         actorBalance += amount;
  //       } else if (eventName === "Unstaked") {
  //         actorBalance -= amount;
  //         if (actorBalance < 0) actorBalance = 0; // Optional guard
  //       }

  //       if (actorBalance === 0) {
  //         pipeline.hdel("staker_amounts", actor);
  //       } else {
  //         pipeline.hset("staker_amounts", actor, actorBalance);
  //       }
  //     }

  //     try {
  //       await pipeline.exec();
  //       console.log("Batch processed successfully");
  //     } catch (error) {
  //       console.error("Error executing pipeline", error);
  //     }
  //   } catch (e) {
  //     console.log(e, "Error processing batch");
  //   }
  // }
}
