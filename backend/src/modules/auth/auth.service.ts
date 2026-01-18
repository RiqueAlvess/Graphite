import prisma from '../../lib/prisma.js'
import { hashPassword, comparePassword } from '../../lib/bcrypt.js'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../lib/jwt.js'
import type { AuthResponse } from '../../types/index.js'

export class AuthService {
  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new Error('EMAIL_EXISTS')
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        plan: 'FREE',
      },
    })

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      plan: user.plan,
    })

    const refreshToken = generateRefreshToken(user.id)

    // Store refresh token
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new Error('INVALID_CREDENTIALS')
    }

    // Verify password
    const isValid = await comparePassword(password, user.password)

    if (!isValid) {
      throw new Error('INVALID_CREDENTIALS')
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      plan: user.plan,
    })

    const refreshToken = generateRefreshToken(user.id)

    // Store refresh token
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    // Verify refresh token
    let payload
    try {
      payload = verifyRefreshToken(refreshToken)
    } catch (error) {
      throw new Error('INVALID_REFRESH_TOKEN')
    }

    // Check if token exists in database
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    })

    if (!tokenRecord) {
      throw new Error('INVALID_REFRESH_TOKEN')
    }

    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
      throw new Error('REFRESH_TOKEN_EXPIRED')
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: tokenRecord.user.id,
      email: tokenRecord.user.email,
      plan: tokenRecord.user.plan,
    })

    return { accessToken }
  }

  async logout(refreshToken: string): Promise<void> {
    // Delete refresh token from database
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    })
  }
}

export default new AuthService()
