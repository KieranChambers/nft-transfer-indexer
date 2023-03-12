const { tableName, createTable, dropTable } = require("../src/config.json");

async function tableSetup(db) {
  if (dropTable && createTable === true) {
    console.log("You can't create and drop a table at the same time. Ending process.");
    process.exit();
  }

  if (createTable) {
    console.log(`Creating table: ${tableName}`);
    await tableCreate(db);
  } else if (dropTable) {
    console.log(`Dropping table: ${tableName}`);
    await tableDrop(db);
    process.exit();
  }
}

async function tableCreate(db) {
  await db.query(
    `CREATE TABLE IF NOT EXISTS ${tableName} (
    "transfer_event_id" INTEGER PRIMARY KEY,
    "block_number" INTEGER,
    "timestamp" INTEGER,
    "sender" VARCHAR(50),
    "receiver" VARCHAR(50),
    "nft_token_id" INTEGER,
    "weth_price" DECIMAL(10, 2),
    "transaction_hash" VARCHAR(100)
    )`
  );
  console.log(`Completed creating ${tableName}`);
}

async function tableDrop(db) {
  await db.query(`DROP TABLE IF EXISTS ${tableName}`);
  console.log(`Completed removing ${tableName}`);
}

module.exports = { tableSetup };
