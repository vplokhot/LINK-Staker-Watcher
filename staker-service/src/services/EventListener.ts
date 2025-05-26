import { ethers, Contract, Interface, EventLog, Log } from "ethers";
import { Event } from "../types";

/**
 * Listens for on-chain events from the staking smart contract,
 * and transforms event into a normalized internal format for downstream processing.
 *
 * @property contract - The smart contract instance with WebSocketProvider used to listen for real-time events.
 * @property iface - The contract interface used to decode log data.
 */

export class EventListener {
  private iface: Interface;
  private contract: Contract;
  constructor(contract: Contract, iface: Interface) {
    this.contract = contract;
    this.iface = iface;
  }

  parseEvent(event: EventLog | Log): Event {
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
   * Starts listening for a specific event name on the contract and logs new events as they occur.
   * This function relies on WebSocketProvider for real-time event streaming.
   *
   * @param eventName - Smart contract event name "Staked" or "Unstaked"
   */
  async start(eventName: string): Promise<Event[] | []> {
    try {
      console.log("Initializing listener for event: ", eventName);
      this.contract.on(eventName, async (...args) => {
        const eventData = [...args];
        console.log("New Event - ", eventName, " : ", eventData);
      });
    } catch (e) {
      console.error(`Error listening to ${eventName}:`, e);
      return e;
    }
  }
}
