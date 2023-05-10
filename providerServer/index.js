const express = require("express");
const path = require("path");
const app = express();
const Routes = require("./routes.js");
const bodyParser = require("body-parser");
const cors = require("cors");

const Web3 = require('web3');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

address = process.env.ADDRESS;
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL));

const agentABI = JSON.parse(fs.readFileSync('../build/contracts/Agent.json', 'utf8'));
const agentContract = new web3.eth.Contract(agentABI.abi);
let agent;

let records = [];

app.use(cors());
app.use(bodyParser.json());
app.use("/", Routes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});