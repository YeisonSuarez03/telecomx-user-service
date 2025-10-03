import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import usersRouter from './routes/Users.routes.js';

dotenv.config();

const app = express();
app.use(express.json());

// Connect to MongoDB (if MONGODB_URI provided)
connectDB();

app.get('/', (req, res) => res.send({ ok: true, service: 'telecomx-user-service' }));
app.use('/users', usersRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
