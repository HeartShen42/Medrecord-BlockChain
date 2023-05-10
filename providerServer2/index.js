const express = require("express");
const path = require("path");
const app = express();
const Routes = require("./routes.js");
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(cors());
app.use(bodyParser.json());
app.use("/", Routes);

const port = process.env.PORT || 3003;
app.listen(port, () => {
    console.log(`Provider2 Server is running on port ${port}`);
});