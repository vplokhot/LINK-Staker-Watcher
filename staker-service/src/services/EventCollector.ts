import { ethers, Contract, Interface, EventLog, Log } from "ethers";
import { Event } from "../types";

/**
 * Queries historical on-chain events from a smart contract,
 * and transforms event into a normalized internal format for downstream processing.
 *
 * @property contract - The smart contract instance with JsonRpcProvider used to fetch logs.
 * @property iface - The contract interface used to decode log data.
 */

export class EventCollector {
  private iface: Interface;
  private contract: Contract;
  constructor(contract: Contract, iface: Interface) {
    this.contract = contract;
    this.iface = iface;
  }

  private parseEvent(event: EventLog | Log): Event {
    const { transactionHash, blockNumber } = event;
    const decodedLog = this.iface.parseLog(event);
    const { args, name } = decodedLog;
    const actor = args[0];
    const amount = parseFloat(ethers.formatUnits(args[1], 18));

    return {
      transactionHash,
      blockNumber,
      eventName: name,
      actor,
      amount,
    };
  }

  /**
   * Collects and parses a specific event type over a given block range.
   *
   * @param eventName - The name of the event to filter (e.g., "Staked", "Unstaked").
   * @param fromBlock - The starting block number for the query range.
   * @param toBlock - The ending block number for the query range.
   * @returns An array of parsed events, or an empty array if an error occurs.
   */
  async collect(
    eventName: string,
    fromBlock: number,
    toBlock: number
  ): Promise<Event[] | []> {
    try {
      console.log(`Collecting events from block ${fromBlock} to ${toBlock}...`);
      const events = await this.contract.queryFilter(
        eventName,
        fromBlock,
        toBlock
      );

      const parsedEvents = [];

      for (let event of events) {
        try {
          parsedEvents.push(this.parseEvent(event));
        } catch (e) {
          console.warn(
            `Skipping invalid event (tx: ${event.transactionHash}):`,
            e
          );
        }
      }
      return parsedEvents;
    } catch (e) {
      console.error(
        `Error collecting from block ${fromBlock} to ${toBlock}:`,
        e
      );
      return [];
    }
  }
}
