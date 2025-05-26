Purpose of the app is to analyze LINK transfer activity of the wallets staked in the Chainlink Community Pool
-Staking Service is to be launched first to sync staking events and create registry of active stakers
-TODO: Transfer service is launched second and listens for token transfers that involve active stakers
-TODO: Analytics service to analyze transfer data

Startup:

- docker-compose up -d to start postgres and redis
- npm install (staker-service)
- npm run dev (staker-service)

Collection of historical contract events will begin from the contract deployment block on the first start

<!-- TODO:
        - dockerize Staker + Transfer services
        - API to trigger sync + start/stop listeners
 -->
