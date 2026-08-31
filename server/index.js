import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import swaggerUi from 'swagger-ui-express';
import {
  authenticateToken,
  validateTask,
  validateRegister,
  validateLogin,
} from './middleware/authMiddleware.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.DB_NAME || 'taskmanager';
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_practical7_awdf';

const app = express();
app.use(express.json());

// CORS configuration supporting Authorization headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

let db, tasksCol, usersCol, client;
let isMongoConnected = false;

// Fallback in-memory store if MongoDB instance is offline
const inMemoryUsers = [];
const inMemoryTasks = [
  { id: 1, title: 'Complete Practical Assignment', description: 'Finish task management integration', status: 'pending' },
  { id: 2, title: 'Review React Router', description: 'Ensure all pages route correctly', status: 'pending' },
];

// -------------------------------------------------------------
// SWAGGER OPENAPI DOCUMENTATION SPECIFICATION
// -------------------------------------------------------------
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Task Management API with JWT Authentication',
    version: '1.0.0',
    description: 'Practical 7 - Express API supporting Register, Login, JWT auth, /me profile, input validation, and Task CRUD',
  },
  servers: [{ url: 'http://localhost:5000', description: 'Express Backend API' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'student@example.com' },
                  password: { type: 'string', example: 'Password123' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered successfully' },
          400: { description: 'Validation error or user already exists' },
        },
      },
    },
    '/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login user & generate JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'student@example.com' },
                  password: { type: 'string', example: 'Password123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful, returns JWT token' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get authenticated user details',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Safe user profile (id, email)' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'Get paginated tasks for current user',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 5 } },
        ],
        responses: {
          200: { description: 'Tasks list with meta pagination' },
          401: { description: 'Unauthorized' },
        },
      },
      post: {
        tags: ['Tasks'],
        summary: 'Create a new task',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string', example: 'Complete Practical 7' },
                  description: { type: 'string', example: 'JWT authentication integration' },
                  status: { type: 'string', enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Task created successfully' },
          400: { description: 'Title is required' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/tasks/{id}': {
      get: {
        tags: ['Tasks'],
        summary: 'Get task by numeric ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Task details' },
          404: { description: 'Task not found' },
        },
      },
      put: {
        tags: ['Tasks'],
        summary: 'Update task by numeric ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string', example: 'Updated Title' },
                  description: { type: 'string', example: 'Updated Description' },
                  status: { type: 'string', enum: ['pending', 'in-progress', 'completed'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Task updated successfully' },
          400: { description: 'Title is required' },
          404: { description: 'Task not found' },
        },
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Delete task by numeric ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Task deleted successfully' },
          401: { description: 'Unauthorized' },
        },
      },
    },
  },
};

// Serve Swagger UI documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

async function start() {
  // Try connecting to MongoDB with a short timeout
  try {
    client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 2000 });
    await client.connect();
    db = client.db(DB_NAME);
    tasksCol = db.collection('tasks');
    usersCol = db.collection('users');
    await usersCol.createIndex({ email: 1 }, { unique: true });
    isMongoConnected = true;
    console.log('Connected to MongoDB at', MONGO_URI, 'DB:', DB_NAME);
  } catch (err) {
    isMongoConnected = false;
    console.warn('MongoDB connection unavailable at', MONGO_URI, '- Running with in-memory persistence.');
  }

  // Root Info API
  app.get('/', (req, res) => {
    res.json({
      message: 'Task Manager API with JWT Authentication is running!',
      swagger: 'http://localhost:5000/api-docs',
      mongoConnected: isMongoConnected,
      endpoints: {
        swaggerUI: 'GET /api-docs',
        register: 'POST /register',
        login: 'POST /login',
        me: 'GET /me (Protected)',
        tasks: '/tasks (Protected)',
        taskById: '/tasks/:id (Protected)',
      },
    });
  });

  // -------------------------------------------------------------
  // AUTHENTICATION ROUTES (Public)
  // -------------------------------------------------------------

  // POST /register
  app.post('/register', validateRegister, async (req, res) => {
    try {
      const email = req.body.email.trim().toLowerCase();
      const password = req.body.password;

      if (isMongoConnected) {
        const existingUser = await usersCol.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: 'User already exists with this email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { email, password: hashedPassword, createdAt: new Date() };
        const result = await usersCol.insertOne(newUser);

        return res.status(201).json({
          message: 'User registered successfully',
          userId: result.insertedId,
        });
      } else {
        const existingUser = inMemoryUsers.find((u) => u.email === email);
        if (existingUser) {
          return res.status(400).json({ message: 'User already exists with this email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
          id: `user_${Date.now()}`,
          email,
          password: hashedPassword,
          createdAt: new Date(),
        };
        inMemoryUsers.push(newUser);

        return res.status(201).json({
          message: 'User registered successfully',
          userId: newUser.id,
        });
      }
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ message: 'Server error during registration' });
    }
  });

  // POST /login
  app.post('/login', validateLogin, async (req, res) => {
    try {
      const email = req.body.email.trim().toLowerCase();
      const password = req.body.password;

      let user = null;
      if (isMongoConnected) {
        user = await usersCol.findOne({ email });
      } else {
        user = inMemoryUsers.find((u) => u.email === email);
      }

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const userIdStr = user._id ? user._id.toString() : user.id;

      const token = jwt.sign(
        { id: userIdStr, email: user.email },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: userIdStr,
          email: user.email,
        },
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Server error during login' });
    }
  });

  // -------------------------------------------------------------
  // PROTECTED ROUTES
  // -------------------------------------------------------------

  // GET /me
  app.get('/me', authenticateToken, async (req, res) => {
    try {
      let user = null;
      if (isMongoConnected) {
        try {
          user = await usersCol.findOne({ _id: new ObjectId(req.user.id) });
        } catch {
          user = await usersCol.findOne({ email: req.user.email });
        }
      } else {
        user = inMemoryUsers.find((u) => u.id === req.user.id || u.email === req.user.email);
      }

      if (!user && !req.user.email) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        id: req.user.id,
        email: req.user.email,
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error retrieving user profile' });
    }
  });

  // GET /tasks (Protected)
  app.get('/tasks', authenticateToken, async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.max(1, parseInt(req.query.limit, 10) || 5);
      const skip = (page - 1) * limit;

      let tasks = [];
      let total = 0;

      if (isMongoConnected) {
        const filter = {
          $or: [{ userId: req.user.id }, { userId: { $exists: false } }],
        };
        total = await tasksCol.countDocuments(filter);
        tasks = await tasksCol.find(filter).sort({ id: 1 }).skip(skip).limit(limit).toArray();
      } else {
        const userTasks = inMemoryTasks.filter((t) => !t.userId || t.userId === req.user.id);
        total = userTasks.length;
        tasks = userTasks.slice(skip, skip + limit);
      }

      res.json({
        tasks,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      });
    } catch (err) {
      console.error('Fetch tasks error:', err);
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  });

  // GET /tasks/:id (Protected)
  app.get('/tasks/:id', authenticateToken, async (req, res) => {
    try {
      const id = Number(req.params.id);
      let task = null;

      if (isMongoConnected) {
        task = await tasksCol.findOne({ id });
      } else {
        task = inMemoryTasks.find((t) => t.id === id);
      }

      if (!task) return res.status(404).json({ message: 'Task not found' });
      res.json(task);
    } catch (err) {
      res.status(500).json({ message: 'Error retrieving task' });
    }
  });

  // POST /tasks (Protected & Validated)
  app.post('/tasks', authenticateToken, validateTask, async (req, res) => {
    try {
      const data = req.body || {};

      if (isMongoConnected) {
        const highest = await tasksCol.find({}).sort({ id: -1 }).limit(1).toArray();
        const nextId = highest[0] && typeof highest[0].id === 'number' ? highest[0].id + 1 : 1;
        const doc = {
          id: nextId,
          status: 'pending',
          ...data,
          userId: req.user.id,
          createdAt: new Date(),
        };
        const result = await tasksCol.insertOne(doc);
        const inserted = await tasksCol.findOne({ _id: result.insertedId });
        return res.status(201).json(inserted);
      } else {
        const highestId = inMemoryTasks.length > 0 ? Math.max(...inMemoryTasks.map((t) => t.id)) : 0;
        const newTask = {
          id: highestId + 1,
          status: 'pending',
          ...data,
          userId: req.user.id,
          createdAt: new Date(),
        };
        inMemoryTasks.push(newTask);
        return res.status(201).json(newTask);
      }
    } catch (err) {
      console.error('Create task error:', err);
      res.status(500).json({ message: 'Failed to create task' });
    }
  });

  // PUT /tasks/:id (Protected & Validated)
  app.put('/tasks/:id', authenticateToken, validateTask, async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (isMongoConnected) {
        const update = { $set: { ...req.body, updatedAt: new Date() } };
        const result = await tasksCol.findOneAndUpdate({ id }, update, { returnDocument: 'after' });
        if (!result.value) return res.status(404).json({ message: 'Task not found' });
        return res.json(result.value);
      } else {
        const index = inMemoryTasks.findIndex((t) => t.id === id);
        if (index === -1) return res.status(404).json({ message: 'Task not found' });
        inMemoryTasks[index] = { ...inMemoryTasks[index], ...req.body, updatedAt: new Date() };
        return res.json(inMemoryTasks[index]);
      }
    } catch (err) {
      console.error('Update task error:', err);
      res.status(500).json({ message: 'Failed to update task' });
    }
  });

  // DELETE /tasks/:id (Protected)
  app.delete('/tasks/:id', authenticateToken, async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (isMongoConnected) {
        const result = await tasksCol.deleteOne({ id });
        return res.json({ deletedCount: result.deletedCount });
      } else {
        const index = inMemoryTasks.findIndex((t) => t.id === id);
        if (index === -1) return res.json({ deletedCount: 0 });
        inMemoryTasks.splice(index, 1);
        return res.json({ deletedCount: 1 });
      }
    } catch (err) {
      console.error('Delete task error:', err);
      res.status(500).json({ message: 'Failed to delete task' });
    }
  });

  app.listen(PORT, () => {
    console.log(`API server listening on http://localhost:${PORT}`);
    console.log(`Swagger UI Documentation available at http://localhost:${PORT}/api-docs`);
  });
}

start();

process.on('SIGINT', async () => {
  console.log('Shutting down...');
  try {
    if (client) await client.close();
  } catch (e) {}
  process.exit(0);
});
