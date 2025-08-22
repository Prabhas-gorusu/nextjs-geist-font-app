import { Pool } from 'pg';
import { MongoClient } from 'mongodb';

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// MongoDB connection
let mongoClient: MongoClient | null = null;

export async function connectPostgres() {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL');
    return client;
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    throw error;
  }
}

export async function connectMongo() {
  try {
    if (!mongoClient) {
      mongoClient = new MongoClient(process.env.MONGODB_URI!);
      await mongoClient.connect();
    }
    console.log('Connected to MongoDB');
    return mongoClient.db('farmer_retailer_db');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export { pool };
