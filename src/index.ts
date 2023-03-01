require("dotenv").config();
import config from "config";
import app from "./app";

const port = config.get<number>("port");

if (process.env.NODE_ENV === "development")
  app.listen(port, () => {
    console.log(`Server on port: ${port}`);
  });
