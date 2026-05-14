import AgentAPI  from "apminsight";
AgentAPI.config()
import 'dotenv/config';
import express, { Request, Response } from 'express';
import subjectsRouter from './routes/subjects.js';
import cors from 'cors';
import securityMiddleware from './middleware/security.js';
import {toNodeHandler} from "better-auth/node";
import {auth} from "./lib/auth";

const app = express();
const port = 8000;
if(!process.env.FRONTEND_URL) throw new Error("FRONTEND_URL environment variable is not set in .env file")
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }),
);
app.all('/api/auth/*splat', toNodeHandler(auth));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(securityMiddleware);

app.use('/api/subjects', subjectsRouter)

// Root GET route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the Classroom API!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
