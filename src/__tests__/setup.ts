import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables from .env.test file
config({ path: '.env.test' });

// Create a new PrismaClient instance for testing
const prisma = new PrismaClient();

// Global setup
beforeAll(async () => {
  // Add any global setup here
  // For example, create test database or seed data
});

// Global teardown
afterAll(async () => {
  // Clean up after all tests
  await prisma.$disconnect();
});

// Reset database before each test
beforeEach(async () => {
  // Clear all tables
  await prisma.user.deleteMany();
  await prisma.twoFA.deleteMany();
  await prisma.loginHistory.deleteMany();
  await prisma.userMetaData.deleteMany();
});

// Export prisma instance for use in tests
export { prisma }; 