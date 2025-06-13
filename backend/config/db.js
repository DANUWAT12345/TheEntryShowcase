import mongoose from 'mongoose';
const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('MongoDB connected'); // Corrected variable name
};
export default connectDB;
