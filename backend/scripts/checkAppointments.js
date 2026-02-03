import mongoose from 'mongoose';
import Appointment from '../src/models/Appointment.js';
import User from '../src/models/User.js';
import fs from 'fs';

// Script: Checks all appointments in the DB and prints their owners
// Connects to MongoDB, fetches all appointments, and prints client info for each
async function check() {
  try {
    await mongoose.connect('mongodb+srv://admin:admin2024@cluster0.lywpoc0.mongodb.net/smartq?retryWrites=true&w=majority');
    console.log("Connected to DB");

    const allApps = await Appointment.find({}).lean();
    console.log(`Total apps: ${allApps.length}`);
    for (const a of allApps) {
        const u = await User.findById(a.client).lean();
        console.log(`Appt ${a._id} owned by ${a.client} (${u ? u.name : 'Unknown User'})`);
    }
    
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

check();
