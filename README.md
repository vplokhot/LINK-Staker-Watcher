Staking Service startup:
connect to db
connect to RPC node
load contract ABI + instantiate contract interface
determine start block
check if Redis exists
-> yes, get latest block from Redis and set start block
-> no, get latest block from DB
-> if no records in DB, set contract deployment block as start block

     ? reconstruct Redis ?
           -> if Redis is dead, and latest block was set via DB
                 -> rebuild Redis using DB

     sync on-chain events
       query events from start block to current block
         parse and load into DB
           update Redis

     start real time listner
         parse and load incoming events into DB
           update Redis

<!-- TODO:
        - dockerize Staker + Transfer services
 -->
