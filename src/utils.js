require("dotenv").config();
const { Contract, providers } = require("ethers");
const { Client } = require("pg");
const fetch = require("node-fetch");
const provider = new providers.JsonRpcBatchProvider(process.env.RPC_URL);
const database = new Client({
  host: "127.0.0.1",
  port: 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "mydatabase",
});

async function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function getBlockTimestamp(blockNumber) {
  return await provider.getBlock(blockNumber).then((res) => res.timestamp);
}

async function dbConnect() {
  database.connect().catch((error) => {
    console.error("Failed to connect to database.", error);
  });
  return database;
}

async function getEventHistory(contract, event, startBlock, endBlock, step, eventProcessor) {
  const logsPromise = [];

  for (startBlock; startBlock <= endBlock; startBlock += step) {
    console.log(`Current Block: ${startBlock}. Blocks left: ${endBlock - startBlock}`);
    const end = Math.min(startBlock + step - 1, endBlock);

    logsPromise.push(contract.queryFilter(event, startBlock, end));
    await sleep(500); // RPC issues
  }

  return await Promise.all(logsPromise).then((nestedLogs) => nestedLogs.flat(1).map(eventProcessor));
}

async function convertEvent(event) {
  const eventData = {
    BLOCKNUMBER: event.blockNumber,
    FROM: event.args.from,
    TO: event.args.to,
    NFTID: Number(event.args.tokenId),
    TX: event.transactionHash,
  };
  return eventData;
}

async function getWethHistoricalPrice(blockNumber) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `{
              pair( id: "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc" block: {number: ${blockNumber}}) {
                token0Price
               }
              }`,
    }),
  };

  try {
    let res = await fetch("https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2", options);
    let resData = await res.json();
    let wethPrice = await resData.data.pair.token0Price;
    if (wethPrice != undefined) {
      return wethPrice;
    } else {
      getWethHistoricalPrice(blockNumber);
      console.log("retrying");
    }
  } catch (error) {
    console.log("catching inside utils", error);
  }
}

module.exports = {
  Contract,
  provider,
  dbConnect,
  sleep,
  getEventHistory,
  getBlockTimestamp,
  convertEvent,
  getWethHistoricalPrice,
};
