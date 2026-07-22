import 'dotenv/config';
import cluster from 'cluster';
import os from 'os';
import app from './app';
import { connectDB } from './config/db';

const PORT = process.env.PORT || 5000;
const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} is running`);
  console.log(`Forking server across ${numCPUs} CPU cores for load balancing...`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Handle worker failure and restart automatically
  cluster.on('exit', (worker, code, signal) => {
    console.warn(`Worker process ${worker.process.pid} died (Code: ${code}). Restarting...`);
    cluster.fork();
  });
} else {
  // Workers can share any TCP connection, including the HTTP server
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Worker process ${process.pid} is listening on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error(`Worker process ${process.pid} - MongoDB connection error:`, error);
      process.exit(1);
    });
}
