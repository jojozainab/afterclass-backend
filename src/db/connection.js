const { MongoClient } = require('mongodb');

async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing');
  }

  const client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  try {
    await client.connect();
    const database = client.db(process.env.MONGODB_DB || 'afterclass');
    await database.command({ ping: 1 });
    return { client, database };
  } catch (error) {
    await client.close();
    throw error;
  }
}

module.exports = { connectDatabase };
