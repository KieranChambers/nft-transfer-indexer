const {
  Contract,
  provider,
  dbConnect,
  sleep,
  getEventHistory,
  getBlockTimestamp,
  convertEvent,
  getWethHistoricalPrice,
} = require("./utils");

const { tableSetup } = require("../db/tableSetup");
const { nftContractAddress, nftContractStartBlock, tableName } = require("./config.json");
const transferEventAbi = ["event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"];

async function nftTransferIndexer() {
  const db = await dbConnect();
  await tableSetup(db);

  async function getPreviousBlocks() {
    try {
      const nftContract = new Contract(nftContractAddress, transferEventAbi, provider);
      const transferEvent = nftContract.filters.Transfer();
      const currentBlock = await provider.getBlock().then((res) => res.number);

      let startBlock =
        (await db.query(`SELECT MAX("block_number") FROM ${tableName}`).then((res) => res.rows[0].max)) ||
        nftContractStartBlock - 1;
      startBlock += 1;

      const history = await getEventHistory(
        nftContract,
        transferEvent,
        startBlock,
        currentBlock,
        2000,
        convertEvent
      ).then((res) => res.flat(1));

      if (history != "") {
        let jsonContent = JSON.stringify(await Promise.all(history), null, 2);
        addEventsToDb(jsonContent);
      } else {
        console.log("No new events. Stopping.");
        process.exit();
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function addEventsToDb(results) {
    let timestamp = null;
    let wethPrice = null;
    try {
      const parsedResults = JSON.parse(results);
      const parsedResultsLength = parsedResults.length;
      let resultsLeft = parsedResults.length;

      let currentEventId =
        (await db.query(`SELECT MAX("transfer_event_id") FROM ${tableName}`).then((res) => res.rows[0].max)) || -1;
      currentEventId += 1;

      for (let i = 0; i < parsedResultsLength; i++) {
        try {
          timestamp = await getBlockTimestamp(parsedResults[i].BLOCKNUMBER);
          wethPrice = await getWethHistoricalPrice(parsedResults[i].BLOCKNUMBER);

          if (timestamp != null && wethPrice != null) {
            console.log(i, `timestamp: ${timestamp}, wethPrice: ${wethPrice}`);
            console.log(`Adding in: ${currentEventId}. Events left: ${resultsLeft}`);

            await db.query(
              `INSERT INTO ${tableName}(transfer_event_id, block_number, timestamp, sender, receiver, nft_token_id, weth_price, transaction_hash)
            VALUES(${currentEventId},
              ${parsedResults[i].BLOCKNUMBER},
              ${timestamp},
              '${parsedResults[i].FROM}',
              '${parsedResults[i].TO}',
              ${parsedResults[i].NFTID},
              ${wethPrice},
              '${parsedResults[i].TX}')`
            );
            currentEventId++;
            resultsLeft--;
            await sleep(100); // ! Ethers.js rate limit / Uniswap subgraph rate limit
          } else {
            console.log("Weth or timestamp returned null. Waiting for timestamp and wethPrice to be fetched.");
          }
        } catch (error) {
          console.log(error);
        }
      }
      console.log("Completed adding new transfer events to DB.");
    } catch (error) {
      console.log(error);
    }
  }
  getPreviousBlocks();
}

nftTransferIndexer();
