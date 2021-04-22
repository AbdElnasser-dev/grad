require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const routes = require("./routes/authRouter")
const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
//Routes

// app.use("/api",routes);
app.use("/api",require('./routes/authRouter'));
app.use("/api",require('./routes/userRoutes'));

const URL = process.env.MONGO_URL;
mongoose.connect(
  URL,
  {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) throw err;
    console.log("Connected to mongodb ");
  }
);
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`server is running on port http://localhost:${port}`);
});
