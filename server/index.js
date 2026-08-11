import express from 'express';
import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.DB_NAME || 'taskmanager';
const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());

// Simple CORS for local dev
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

let db, tasksCol, client;

async function start() {
  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    tasksCol = db.collection('tasks');
    console.log('Connected to MongoDB at', MONGO_URI, 'DB:', DB_NAME);

    app.get('/tasks', async (req, res) => {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.max(1, parseInt(req.query.limit, 10) || 5);
      const skip = (page - 1) * limit;

      const total = await tasksCol.countDocuments();
      const tasks = await tasksCol.find({}).sort({ id: 1 }).skip(skip).limit(limit).toArray();

      res.json({
        tasks,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      });
    });

    app.get('/tasks/:id', async (req, res) => {
      const id = Number(req.params.id);
      const task = await tasksCol.findOne({ id });
      if (!task) return res.status(404).json({ error: 'Not found' });
      res.json(task);
    });

    app.post('/tasks', async (req, res) => {
      const data = req.body || {};
      const highest = await tasksCol.find({}).sort({ id: -1 }).limit(1).toArray();
      const nextId = highest[0] && typeof highest[0].id === 'number' ? highest[0].id + 1 : 1;
      const doc = { id: nextId, ...data };
      const result = await tasksCol.insertOne(doc);
      const inserted = await tasksCol.findOne({ _id: result.insertedId });
      res.status(201).json(inserted);
    });

    app.put('/tasks/:id', async (req, res) => {
      const id = Number(req.params.id);
      const update = { $set: req.body };
      const result = await tasksCol.findOneAndUpdate({ id }, update, { returnDocument: 'after' });
      if (!result.value) return res.status(404).json({ error: 'Not found' });
      res.json(result.value);
    });

    app.delete('/tasks/:id', async (req, res) => {
      const id = Number(req.params.id);
      const result = await tasksCol.deleteOne({ id });
      res.json({ deletedCount: result.deletedCount });
    });

    app.listen(PORT, () => console.log(`API server listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();

process.on('SIGINT', async () => {
  console.log('Shutting down...');
  try { await client.close(); } catch (e) {}
  process.exit(0);
});
