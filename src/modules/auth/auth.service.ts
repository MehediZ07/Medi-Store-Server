import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
}

export const createUser = async (userData: CreateUserData) => {
  const { name, email, password, role } = userData;

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  // Validate password length
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (existingUser) {
    throw new Error('Email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user and account in transaction
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        role,
        emailVerified: true,
        status: 'ACTIVE'
      }
    });

    await tx.account.create({
      data: {
        userId: user.id,
        accountId: user.id,
        providerId: 'credential',
        password: hashedPassword
      }
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    };
  });

  return result;
};

export const loginUser = async (email: string, password: string) => {
  if (!process.env.BETTER_AUTH_SECRET) {
    throw new Error('JWT secret is not configured');
  }

  // Find user with account
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      accounts: {
        where: { providerId: 'credential' }
      }
    }
  });

  if (!user || user.accounts.length === 0) {
    return null;
  }

  const account = user.accounts[0];
  if (!account.password) {
    return null;
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, account.password);
  if (!isValidPassword) {
    return null;
  }

  // Check if user is active
  if (user.status !== 'ACTIVE') {
    throw new Error('Account is suspended or inactive');
  }

  // Generate JWT token
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.BETTER_AUTH_SECRET,
    { expiresIn: '24h' }
  );

  // Create session
  await prisma.session.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified
    }
  };
};

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      emailVerified: true,
      image: true,
      createdAt: true
    }
  });

  return user;
};

export const invalidateSession = async (token: string) => {
  await prisma.session.deleteMany({
    where: { token }
  });
};