import { CONTRACT_ADDRESS } from "./config/constants";
import { StakingContractABI } from "./config/abi";
import { configDotenv } from "dotenv";
import { Contract, Interface } from "ethers";
import { initializeInfrastructure } from "./infra/init";
import { Orchestrator } from "./services/Orchestrator";
import { EventCollector } from "./services/EventCollector";
import { EventListener } from "./services/EventListener";

configDotenv();

/**
 *
 * Initializes core infra (Redis, providers, event repo),
 * constructs Ethereum contract interfaces and their listeners,
 * and starts the orchestration process for syncing historical events
 * and listening for real-time staking activity.
 *
 */
const init = async () => {
  try {
    const { eventRepo, redis, provider, socketProvider } =
      await initializeInfrastructure();

    const contract = new Contract(
      CONTRACT_ADDRESS,
      StakingContractABI,
      provider
    );
    const contractWithSocket = new Contract(
      CONTRACT_ADDRESS,
      StakingContractABI,
      socketProvider
    );
    const iface = new Interface(StakingContractABI);

    const eventCollector = new EventCollector(contract, iface);
    const eventListener = new EventListener(contractWithSocket, iface);

    const orchestrator = new Orchestrator(
      eventCollector,
      eventListener,
      eventRepo,
      redis,
      provider,
      socketProvider
    );

    await orchestrator.sync();
    // await orchestrator.startListeners();
  } catch (e) {
    console.log("Error: ", e);
    process.exit(1);
  }
};

init();
