import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
  host: process.env.BULLMQ_HOST || "127.0.0.1",
  port: process.env.BULLMQ_PORT || 6379,
  maxRetriesPerRequest: null,  // <-- required for BullMQ
});

export const orderQueue = new Queue("orderQueue", { connection });
