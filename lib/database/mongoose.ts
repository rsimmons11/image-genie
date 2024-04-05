"use server"

import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

let cached: MongooseConnection = (global as any).mongoose

if(!cached) {
  cached = (global as any).mongoose = { 
    conn: null, promise: null 
  }
}

export const connectToDatabase = async () => {
  console.log('Starting database connection attempt'); // Log start of connection attempt

  if(cached.conn) {
    console.log('Reusing existing database connection'); // Log if reusing existing connection
    return cached.conn;
  }

  if(!MONGODB_URL) {
    console.error('Missing MONGODB_URL'); // Log error if connection string is missing
    throw new Error('Missing MONGODB_URL');
  }

  console.log('Connecting to MongoDB:', MONGODB_URL); // Log database connection string

  cached.promise = 
    cached.promise || 
    mongoose.connect(MONGODB_URL, { 
      dbName: 'imageGenie', bufferCommands: false 
    })

  try {
    cached.conn = await cached.promise;
    console.log('Connected to the database');
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    throw error; // Rethrow the error for handling by the caller
  }
  
  return cached.conn;
}
