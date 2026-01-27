import "dotenv/config";
import mongoose from "mongoose";
import Business from "../src/models/Business.js";
import Service from "../src/models/Service.js";
import Employee from "../src/models/Employee.js"; // Ensure this model exists or use User with role='employee'
import bcrypt from "bcryptjs";

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // Clear existing data
    await Business.deleteMany({});
    await Service.deleteMany({});
    await Employee.deleteMany({}); // Or User.deleteMany({ role: 'employee' })
    console.log("Cleared existing businesses, services, and employees.");
    
    const passwordHash = await bcrypt.hash("123456", 10);

    // Create Businesses
    const businessConfigs = [
      {
        name: "Barber King",
        niche: "Barbershop",
        address: "123 Main St, Tel Aviv",
        phone: "050-1234567",
      },
      {
        name: "Beauty Queen",
        niche: "Beauty Salon",
        address: "456 Dizengoff St, Tel Aviv",
        phone: "052-7654321",
      },
      {
        name: "Dr. Teeth",
        niche: "Dentist",
        address: "789 Rothschild Blvd, Tel Aviv",
        phone: "03-1234567",
      }
    ];

    const businesses = await Business.insertMany(businessConfigs);
    console.log(`Created ${businesses.length} businesses.`);

    // Create Employees
    const employees = [];
    employees.push({
      name: "John Barber",
      email: "john@barberking.com",
      phone: "050-1111111",
      passwordHash,
      role: "employee",
      businessId: businesses[0]._id
    });
    employees.push({
      name: "Sarah Stylist",
      email: "sarah@beautyqueen.com",
      phone: "050-2222222",
      passwordHash,
      role: "employee",
      businessId: businesses[1]._id
    });
    employees.push({
      name: "Dr. Drill",
      email: "drill@drteeth.com",
      phone: "050-3333333",
      passwordHash,
      role: "employee",
      businessId: businesses[2]._id
    });

    const createdEmployees = await Employee.insertMany(employees); // Assuming Employee model uses User collection or separate
    console.log(`Created ${createdEmployees.length} employees.`);

    // Create Services for each business
    const services = [];

    // Barber King Services
    services.push({
      business: businesses[0]._id,
      name: "Men's Haircut",
      description: "Standard haircut",
      durationMinutes: 30,
      price: 60,
      category: "Hair"
    });
    services.push({
      business: businesses[0]._id,
      name: "Beard Trim",
      description: "Beard shaping and trimming",
      durationMinutes: 15,
      price: 30,
      category: "Beard"
    });

    // Beauty Queen Services
    services.push({
      business: businesses[1]._id,
      name: "Manicure",
      description: "Gel manicure",
      durationMinutes: 45,
      price: 120,
      category: "Nails"
    });
    services.push({
      business: businesses[1]._id,
      name: "Facial Treatment",
      description: "Deep cleansing facial",
      durationMinutes: 60,
      price: 250,
      category: "Face"
    });

     // Dr. Teeth Services
     services.push({
      business: businesses[2]._id,
      name: "Checkup",
      description: "General dental checkup",
      durationMinutes: 20,
      price: 100,
      category: "General"
    });
    services.push({
      business: businesses[2]._id,
      name: "Cleaning",
      description: "Professional teeth cleaning",
      durationMinutes: 40,
      price: 200,
      category: "Hygiene"
    });

    await Service.insertMany(services);
    console.log(`Created ${services.length} services.`);

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedData();
