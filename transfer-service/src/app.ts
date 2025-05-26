import { CONTRACT_ADDRESS, ERC_20_ABI } from "./config/constants";
import { ERC20ContractABI } from "./config/abi";
import { configDotenv } from "dotenv";
import { Contract, ethers, Interface } from "ethers";
import { initializeInfrastructure } from "./infra/init";
import { Orchestrator } from "./services/Orchestrator";
import { EventCollector } from "./services/EventCollector";

configDotenv();

const init = async () => {
  try {
    const { repo, redis, provider } = await initializeInfrastructure();

    const contract = new Contract(CONTRACT_ADDRESS, ERC_20_ABI, provider);
    const iface = new Interface(ERC_20_ABI);

    const eventCollector = new EventCollector(contract, iface);

    const orchestrator = new Orchestrator(
      eventCollector,
      redis,
      provider,
      repo
    );

    await orchestrator.sync();
    // await orchestrator.startListeners();
  } catch (e) {
    console.log("Error: ", e);
    process.exit(1);
  }
};

init();
