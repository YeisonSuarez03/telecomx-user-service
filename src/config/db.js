import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI not set; skipping MongoDB connection (useful for local dev without DB)');
    return;
  }

  console.log({uri});

  try {
    await mongoose.connect(uri, {
      // Mongoose 7+ uses sensible defaults
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

export default connectDB;
