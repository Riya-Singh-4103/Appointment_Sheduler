import mongoose from 'mongoose';

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;
  
  if (!MONGO_URI) {
    console.error("Error: MONGO_URI environment variable is not set");
    process.exit(1);
  }
  
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Database connected successfully");
  } catch (error) {
    console.error('Error while connecting to the database:', error.message);
    process.exit(1);
  }
};

export default connectDB;
