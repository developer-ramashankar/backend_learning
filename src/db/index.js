import mongoose from "mongoose";
import { DB_NAME } from "../contants.js";

const connectDB = async () => {
  try {
     const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/ ${DB_NAME}`)
     console.log(`Mongodb is connected !! Host is ${connectionInstance.connection.host}`)
  } catch (error) {
    console.log(`MongoDb connection FAILED ${error}`);
    process.exit(1);
  }
};
export default connectDB
