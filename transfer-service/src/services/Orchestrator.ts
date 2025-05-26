// Orchestrator.ts
import type { Provider } from "ethers";
import type { EventCollector } from "./EventCollector";
import type { TransferRepo } from "../infra/db/TransferRepo";
import type { RedisClient } from "../infra/redis/RedisClient";
// import { resolveStartBlock } from "./BlockResolver";
import { BATCH_SIZE } from "../config/constants";
import { Accountant } from "./Accountant";
import { wait } from "../utils/wait";

export class Orchestrator {
  private collector: EventCollector;
  private provider: Provider;
  private repo: TransferRepo;
  private redis: RedisClient;
  private accountant: Accountant;
  private shouldTerminate = false;
  constructor(
    _collector: EventCollector,
    _redis: RedisClient,
    _provider: Provider,
    _repo: TransferRepo
  ) {
    this.collector = _collector;
    this.redis = _redis;
    this.provider = _provider;
    this.repo = _repo;
    this.accountant = new Accountant(_redis);
  }
  // constructor(
  //   _collector: EventCollector,
  //   _repo: EventRepo,
  //   _redis: RedisClient,
  //   _provider: Provider
  // ) {
  //   this.collector = _collector;
  //   this.repo = _repo;
  //   this.redis = _redis;
  //   this.provider = _provider;
  //   this.accountant = new Accountant(_redis);
  // }

  async processEvent(event) {
    const { from, to, amount, transactionHash, blockNumber } = event;

    const [fromAmount, toAmount] = await Promise.all([
      this.redis.getBalance(from),
      this.redis.getBalance(to),
    ]);
    if (fromAmount) {
      console.log(
        "SENT FROM : ",
        from,
        ` (${fromAmount} staked)`,
        amount,
        " LINK to ",
        to
      );
    }
    if (toAmount) {
      console.log(
        "RECEIVED FROM : ",
        from,
        amount,
        " LINK to ",
        to,
        ` (${toAmount} staked)`
      );
    }
  }
  async processBatch(events) {
    let stakerTransfers = [];

    for (let event of events) {
      const { from, to, amount, transactionHash, blockNumber } = event;

      const [fromAmount, toAmount] = await Promise.all([
        this.redis.getBalance(from),
        this.redis.getBalance(to),
      ]);
      if (fromAmount || toAmount) {
        stakerTransfers.push(event);
      }
    }

    await this.repo.insertMany(stakerTransfers);
    console.log(`${stakerTransfers.length} transfers from stakers found.`);
  }

  async sync() {
    try {
      console.log("Syncing ...");
      const latestBlock = await this.provider.getBlockNumber();
      let startBlock = 20520674;

      while (startBlock <= latestBlock) {
        const toBlock = Math.min(startBlock + BATCH_SIZE - 1, latestBlock);

        await wait(1500);

        const transfers = await this.collector.collect(
          "Transfer",
          startBlock,
          toBlock
        );
        console.log(
          `${transfers.length} transfers collected between blocks ${startBlock} and ${toBlock}`
        );
        await this.processBatch(transfers);
        // for (let transfer of transfers) {
        //   await this.processEvent(transfer);
        // }

        // await this.repo.insertMany(events);
        // await this.accountant.processBatch(events);
        // await this.repo.setLastProcessedBlock(toBlock);
        // await this.redis.setLastProcessedBlock(toBlock);
        startBlock = toBlock + 1;
      }
      console.log("✅ Sync complete.  ");
    } catch (e) {
      console.log(e, "❌ Error during sync.");
      return false;
    }
  }
  async startListeners() {
    try {
      this.collector.listen("Transfer");

      this.collector.on("transferEvent", async (data) => {
        console.log("checking LINK transfer ...");
        this.processEvent(data);

        // console.log(transactionHash, blockNumber);
      });
    } catch (e) {
      console.log(e, "❌ Error starting listeners.");
      return false;
    }
  }
}
