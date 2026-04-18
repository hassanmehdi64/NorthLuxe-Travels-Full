import mongoose from "mongoose";
import { env } from "./env.js";

let connectionPromise = null;

const connectWithUri = async (uri) =>
  mongoose.connect(uri, {
    family: 4,
    serverSelectionTimeoutMS: 10000,
  });

export const connectDb = async () => {
  if (!env.mongoUri) {
    throw new Error("MONGODB_URI is not configured");
  }

  mongoose.set("strictQuery", true);

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = (async () => {
      try {
        return await connectWithUri(env.mongoUri);
      } catch (primaryError) {
        if (!env.mongoUriFallback) {
          throw primaryError;
        }

        try {
          return await connectWithUri(env.mongoUriFallback);
        } catch (fallbackError) {
          fallbackError.message = `${primaryError.message} | fallback: ${fallbackError.message}`;
          throw fallbackError;
        }
      }
    })();
  }

  try {
    await connectionPromise;
    return mongoose.connection;
  } catch (error) {
    connectionPromise = null;
    throw error;
  }
};
