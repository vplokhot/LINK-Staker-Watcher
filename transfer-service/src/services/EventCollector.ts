import { ethers, Contract, Interface, EventLog, Log } from "ethers";
import { Transfer } from "../types";
import type { RedisClient } from "../infra/redis/RedisClient";
import { EventEmitter } from "events";

export class EventCollector extends EventEmitter {
  private iface: Interface;
  private contract: Contract;
  constructor(contract: Contract, iface: Interface) {
    super();
    this.contract = contract;
    this.iface = iface;
  }

  parseEvent(event: EventLog | Log) {
    const { transactionHash, blockNumber } = event;
    const decodedLog = this.iface.parseLog(event);
    const { args, name } = decodedLog;
    const from = args[0];
    const to = args[1];
    const value = args[2];
    const amount = parseFloat(ethers.formatUnits(value, 18));

    return {
      transactionHash,
      blockNumber,
      eventName: name,
      from,
      to,
      amount,
    };
  }

  async collect(
    eventName: string,
    fromBlock: number,
    toBlock: number
  ): Promise<Transfer[] | []> {
    try {
      console.log(
        `Collecting transfers from block ${fromBlock} to ${toBlock}...`
      );
      const events = await this.contract.queryFilter(
        eventName,
        fromBlock,
        toBlock
      );
      try {
        const parsedEvents = [];
        for (let event of events) {
          parsedEvents.push(this.parseEvent(event));
        }
        return parsedEvents;
      } catch (e) {
        console.error("Error parsing transfers: ", e);
        return [];
      }
    } catch (e) {
      console.error(
        `Error fetching transfers from block ${fromBlock} to ${toBlock}:`,
        e
      );
      return [];
    }
  }

  async listen(eventName: string) {
    try {
      console.log("Initializing listener for event: ", eventName);
      this.contract.on(eventName, async (from, to, amount, event) => {
        // const eventData = [event];

        const { transactionHash, blockNumber } = event.log;

        const result = {
          from,
          to,
          amount,
          transactionHash,
          blockNumber,
        };

        this.emit("transferEvent", result);
      });
    } catch (e) {
      console.error(e, `Error listening for ${eventName} event`);
    }
  }
}
