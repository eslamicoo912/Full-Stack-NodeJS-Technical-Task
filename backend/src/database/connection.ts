import mongoose from 'mongoose';
import { env } from '../shared/config/env';

export const connectDatabase = async (): Promise<void> => {
  try {
    const dbUri = env.NODE_ENV === 'test'
      ? 'mongodb://localhost:27017/full_stack_node_technical_task_test'
      : env.MONGODB_URI || 'mongodb://localhost:27017/full_stack_node_technical_task';

    await mongoose.connect(dbUri);

    if (env.NODE_ENV !== 'test') {
      console.log('MongoDB connected successfully.');
    }
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};