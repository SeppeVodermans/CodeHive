import dotenv from "dotenv";
import path from "path";

dotenv.config({path: path.resolve(__dirname, '.env')});

  console.log("EMAIL:", process.env.ADMIN_EMAIL);
  console.log("PASSWORD:", process.env.ADMIN_PASSWORD);