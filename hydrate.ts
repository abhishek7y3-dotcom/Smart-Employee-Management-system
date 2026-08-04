import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

import { syncAnnouncements, syncUserLeaves, syncUserAttendance } from './server/src/services/chatbot/fastTrackSyncService';
import User from './server/src/models/User';

async function hydrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected to DB. Starting Fast Track Hydration...');

    // 1. Sync global announcements
    console.log('Syncing announcements...');
    await syncAnnouncements();

    // 2. Sync user specific data
    const users = await User.find({}).lean();
    console.log(`Found ${users.length} users. Syncing leaves and attendance...`);
    
    for (const user of users) {
      await syncUserLeaves(user._id.toString());
      await syncUserAttendance(user._id.toString());
    }

    console.log('Hydration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error during hydration:', err);
    process.exit(1);
  }
}

hydrate();
