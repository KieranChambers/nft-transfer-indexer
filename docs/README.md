# NFT Transfer Indexer

This script is still a work in progress. Thanks!

My intention for this script is that the user can take any collection on the ETH network, filter the logs and then build their own data around the information stored in the database.

Here's a quick rundown of how the script works:

1. Fill in the `config.json` with the desired collection
1. Declare the NFT contract, transfer event & retrieve the current block
1. Query the database for the latest block from the stored data (if the starting block returns null, the value from the `config.json` is used)
1. Pass through the values retrieved to the `getEventHistory` function
1. Query the blockchain for the logs and return all events matching the parameters
1. Convert the events, passing through an object with only the necessary data back to the main index
1. Query the blockchain for the timestamp of each individual block and store the results to the `NFT_TRANSFER_EVENTS` table
1. Query the Uniswap subgraph with all unique block numbers from the `NFT_TRANSFER_EVENTS` table and retrieve the weth price for each.
1. Store the new information on the `WETH_HISTORICAL_PRICE` table
1. Join the two tables and start building SQL queries
