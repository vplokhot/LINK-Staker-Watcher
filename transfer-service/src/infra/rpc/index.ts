import { configDotenv } from "dotenv";
import { ethers } from "ethers";

configDotenv();

const RPC_URL = process.env.RPC_URL;

export const provider = new ethers.WebSocketProvider(RPC_URL);
