//
const { Pool } = require("pg");

const senhaThiago = "102030";
const senhaVanessa = "8756";

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: senhaVanessa,
  database: "dindin",
});

module.exports = pool;
