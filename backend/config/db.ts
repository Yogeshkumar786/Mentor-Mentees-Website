import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://localhost:27017/mentor-mentee';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err: Error) => {
    console.error('MongoDB connection error:', err);
  });

export default mongoose;