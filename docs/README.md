# NFT Transfer Indexer

### This script is to demonstrate an understanding of JS, NodeJS, postgres, SQL and the Ethereum blockchain. It's is still a work in progress.

The intention for this script is that the user can take any collection on the ETH network, filter the event logs and then build their own data around the information saved to the database.

Here's a quick rundown of how the script works:

1. Fill in the `config.json` with the desired collection address , starting block and the database table information
2. Query the database for the latest block from the stored data (if the starting block returns null, the value from the `config.json` is used)
3. Run the `index.js` script in the src folder
4. Query the blockchain for the logs and return all events matching the collection address
5. Convert the events, passing through an object with only the required data back to the main index
6. Query the blockchain for the timestamp of each individual block and store the results to the user-created table
7. Query the Uniswap v2 subgraph with all block numbers and retrieve the weth price for each.
8. Store the new information in the user-created table
9. Start building your own queries and data around the information stored in the database
