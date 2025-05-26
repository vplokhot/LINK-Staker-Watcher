import { configDotenv } from "dotenv";
import { ethers } from "ethers";
import { wait } from "../../utils/wait";

configDotenv();

const RPC_URL = process.env.RPC_URL;
const RPC_WS_URL = process.env.RPC_WS_URL;

if (!RPC_URL) throw new Error("Missing RPC_URL in .env");
if (!RPC_WS_URL) throw new Error("Missing RPC_WS_URL in .env");

/**
 * Retry wrapper for JsonRpcProvider
 */
async function getJsonRpcProvider(
  url: string,
  retries = 3
): Promise<ethers.JsonRpcProvider> {
  for (let i = 0; i < retries; i++) {
    try {
      const provider = new ethers.JsonRpcProvider(url);
      //sanity check
      await provider.getBlockNumber();
      console.log(`Connected to RPC`);
      return provider;
    } catch (err) {
      console.warn(`RPC connection failed (attempt ${i + 1}): ${err}`);
      await wait((i + 1) * 1000);
    }
  }
  throw new Error("Failed to connect to RPC after multiple attempts.");
}
/**
 * Create WebSocket provider with basic monitoring
 */
function createWebSocketProvider(url: string): ethers.WebSocketProvider {
  const wsProvider = new ethers.WebSocketProvider(url);

  wsProvider.on("error", (err: any) => {
    console.error("Ethers WebSocket error:", err);
  });

  console.log(`Connected to WebSocket RPC.`);
  return wsProvider;
}

export async function createRpcProviders(): Promise<{
  provider: ethers.JsonRpcProvider;
  socketProvider: ethers.WebSocketProvider;
}> {
  const provider = await getJsonRpcProvider(RPC_URL);
  const socketProvider = createWebSocketProvider(RPC_WS_URL);
  return { provider, socketProvider };
}
