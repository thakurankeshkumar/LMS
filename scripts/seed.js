// Script to seed demo data to MongoDB
// Run: node scripts/seed.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../lib/models/User');
const Test = require('../lib/models/Test');
const Config = require('../lib/models/Config');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Test.deleteMany({});
    await Config.deleteMany({});

    // Create demo users
    const users = await User.insertMany([
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin',
      },
      {
        name: 'Teacher User',
        email: 'teacher@test.com',
        password: 'password123',
        role: 'teacher',
      },
      {
        name: 'Student User 1',
        email: 'student@test.com',
        password: 'password123',
        role: 'student',
      },
      {
        name: 'Student User 2',
        email: 'student2@test.com',
        password: 'password123',
        role: 'student',
      },
    ]);

    console.log('✓ Demo users created');

    // Create demo test
    const teacher = users.find((u) => u.role === 'teacher');
    const students = users.filter((u) => u.role === 'student');

    const test = await Test.create({
      title: 'General Knowledge Quiz',
      description: 'A quick test to check your general knowledge',
      teacherId: teacher._id,
      questions: [
        {
          question: 'What is the capital of France?',
          options: ['London', 'Berlin', 'Paris', 'Madrid'],
          correctAnswer: 2,
          explanation: 'Paris is the capital and largest city of France.',
        },
        {
          question: 'Which planet is known as the Red Planet?',
          options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
          correctAnswer: 1,
          explanation: 'Mars is known as the Red Planet due to its reddish color.',
        },
        {
          question: 'What is the smallest country in the world?',
          options: ['Monaco', 'Vatican City', 'Liechtenstein', 'San Marino'],
          correctAnswer: 1,
          explanation: 'Vatican City is the smallest country in the world.',
        },
        {
          question: 'Who wrote Romeo and Juliet?',
          options: ['William Wordsworth', 'William Shakespeare', 'Jane Austen', 'Charles Dickens'],
          correctAnswer: 1,
          explanation: 'William Shakespeare wrote Romeo and Juliet in the early 1600s.',
        },
        {
          question: 'What is the square root of 144?',
          options: ['10', '12', '14', '16'],
          correctAnswer: 1,
          explanation: 'The square root of 144 is 12 (12 × 12 = 144).',
        },
      ],
      duration: 10,
      totalMarks: 50,
      passingMarks: 20,
      isPublished: true,
      assignedStudents: students.map((s) => s._id),
    });

    console.log('✓ Demo test created');

    // Create config
    await Config.create({
      publicSignup: true,
    });

    console.log('✓ Configuration created');
    console.log('\n✅ Seeding completed successfully!\n');
    console.log('Demo Credentials:');
    console.log('Admin:   admin@test.com / password123');
    console.log('Teacher: teacher@test.com / password123');
    console.log('Student: student@test.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
