// =========================================================================
// INTERVIEW GUIDE: server.ts - The Ignition Switch (Engine Starter)
// Yeh file hamare backend ki entry point hai jahan actually app start hota hai.
// Yahan "Clustering" use ki gayi hai jo is project ko Production-Ready banati hai.
// =========================================================================

import 'dotenv/config'; // .env file load karta hai (PORT aur DB URLs yahan se milte hain)
import cluster from 'cluster'; // Node.js ka built-in module jo ek hi server par multiple processes (workers) chalane me madad karta hai.
import os from 'os'; // Operating System ki details lene ke liye (e.g. computer me kitne CPU core hain).
import app from './app'; // Hamara express app (Engine) jisme saare routes aur middlewares hain.
import { connectDB } from './config/db'; // MongoDB database se connect karne ka function.

// process.env se PORT lo, agar nahi mila (jaise local me), toh default 5000 use karo.
const PORT = process.env.PORT || 5000;

// os.cpus().length check karta hai ki system me kitne CPU cores hain (Example: 4, 8, ya 16).
// Node.js by default Single-threaded hota hai (ek baar me ek kaam).
// Humne is variable ko isliye nikala taaki hum har CPU core par Node ka ek alag server (worker) chala sakein.
const numCPUs = os.cpus().length;

// =========================================================================
// NODE.JS CLUSTERING (Load Balancing) - Very important for Interviews
// =========================================================================

// Check karte hain ki kya ye "Primary" (Master) process hai?
// Primary process request handle nahi karta, wo bas "Workers" banata hai aur unko manage karta hai.
if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} is running`);
  console.log(`Forking server across ${numCPUs} CPU cores for load balancing...`);

  // Loop chala kar jitne CPU cores hain, utne "Worker" processes banate hain.
  // Har "fork()" ka matlab hai Node.js ka ek naya server shuru hona.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Agar kisi karan se (Memory leak, crash, ya bug) koi ek worker band ho jata hai,
  // toh Primary process us crash ko detect karke uski jagah turant ek naya worker (cluster.fork) start kar dega.
  // INTERVIEW: Isse hamari app ki "High Availability" or "Zero Downtime" maintain hoti hai!
  cluster.on('exit', (worker, code, signal) => {
    console.warn(`Worker process ${worker.process.pid} died (Code: ${code}). Restarting...`);
    cluster.fork(); // Crash hone par automatically restart
  });

} else {
  // Agar ye process "Primary" nahi hai, toh iska matlab ye ek "Worker" hai.
  // Har worker request (Frontend se aane wale API calls) ko actually handle karta hai.

  // 1. Worker sabse pehle Database se connect hoga.
  connectDB()
    .then(() => {
      // 2. Agar DB connect ho gaya, toh Express server ko us PORT par listen karne ko bolenge.
      app.listen(PORT, () => {
        console.log(`Worker process ${process.pid} is listening on port ${PORT}`);
      });
    })
    .catch((error) => {
      // Agar Database connect hone me error aayi (e.g. MongoDB band ho), 
      // toh server start nahi hoga aur worker band ho jayega (process.exit(1)).
      console.error(`Worker process ${process.pid} - MongoDB connection error:`, error);
      process.exit(1);
    });
}
