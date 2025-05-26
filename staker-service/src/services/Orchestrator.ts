//types
import type { JsonRpcProvider, WebSocketProvider } from "ethers";
import type { EventCollector } from "./EventCollector";
import type { EventRepo } from "../infra/db/EventRepo";
import type { RedisClient } from "../infra/redis/RedisClient";

import { resolveStartBlock } from "./BlockResolver";
import { BATCH_SIZE } from "../config/constants";
import { Accountant } from "./Accountant";
import { wait } from "../utils/wait";
import { EventListener } from "./EventListener";

/**
 * Coordinates event collection, processing, and cache + db updates.
 * Handles syncing historical events from the blockchain and starts real-time listeners (TODO).
 */
export class Orchestrator {
  private collector: EventCollector;
  private listener: EventListener;
  private provider: JsonRpcProvider;
  private socketProvider: WebSocketProvider;
  private repo: EventRepo;
  private redis: RedisClient;
  private accountant: Accountant;

  constructor(
    _collector: EventCollector,
    _listener: EventListener,
    _repo: EventRepo,
    _redis: RedisClient,
    _provider: JsonRpcProvider,
    _socketProvider: WebSocketProvider
  ) {
    this.collector = _collector;
    this.listener = _listener;
    this.repo = _repo;
    this.redis = _redis;
    this.provider = _provider;
    this.socketProvider = _socketProvider;
    this.accountant = new Accountant(_redis);
  }

  /**
   * Synchronizes historical events from the last processed block and the latest block.
   * Fetches "Staked" and "Unstaked" events, stores them, updates staker balances in Redis,
   * and records the last processed block to avoid reprocessing.
   */
  async sync() {
    try {
      console.log("Syncing ...");
      const latestBlock = await this.provider.getBlockNumber();
      let startBlock = await resolveStartBlock(this.repo, this.redis);

      while (startBlock <= latestBlock) {
        const toBlock = Math.min(startBlock + BATCH_SIZE - 1, latestBlock);

        await wait(1500);

        const [staked, unStaked] = await Promise.all([
          this.collector.collect("Staked", startBlock, toBlock),
          this.collector.collect("Unstaked", startBlock, toBlock),
        ]);

        const events = [...staked, ...unStaked];
        console.log(
          `Events collected between blocks ${startBlock} and ${toBlock} : ${staked.length} Staked --- ${unStaked.length} unstaked`
        );

        await Promise.all([
          this.repo.insertMany(events),
          this.accountant.processBatch(events),
          this.repo.setLastProcessedBlock(toBlock),
          this.redis.setLastProcessedBlock(toBlock),
        ]);

        startBlock = toBlock + 1;
      }
      console.log("Sync complete.");
    } catch (e) {
      console.log(e, "Error during sync.");
      return false;
    }
  }
  /**
   * Starts real-time event listeners via WebSocket provider for staking and unstaking events.
   */
  // async startListeners() {
  //   try {
  //     this.listener.start("Staked");
  //     this.listener.start("Unstaked");
  //   } catch (e) {
  //     console.log(e, "Error starting listeners.");
  //     return false;
  //   }
  // }
}
