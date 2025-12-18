import mongoose from 'mongoose';

export async function connectDB(mongoUri) {
    try {
        await mongoose.connect(mongoUri);
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection error:', error.message);
        process.exit(1);
    }
}
