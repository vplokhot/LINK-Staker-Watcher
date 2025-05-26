export interface Event {
  transactionHash: string;
  blockNumber: number;
  actor: string;
  amount: number;
  eventName: string;
}
