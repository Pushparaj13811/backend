import mongoose from 'mongoose';
import env from './env.js';

export const connectDB = async () => {
  const { connection } = await mongoose.connect(env.MONGODB_URI);
  console.log(`✅ Mongo :: ${connection.host}`);
};
