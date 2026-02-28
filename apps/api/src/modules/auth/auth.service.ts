import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from './redis.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private redis: RedisService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const institution = await this.prisma.institution.findUnique({
      where: { id: dto.institutionId },
    });
    if (!institution) {
      throw new BadRequestException('Institution not found');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
        phone: dto.phone,
        institutionId: dto.institutionId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        institutionId: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role, user.institutionId);

    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role, user.institutionId);

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, ...tokens };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      const storedToken = await this.redis.get(`refresh:${payload.sub}`);
      if (storedToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Rotate refresh token
      const tokens = await this.generateTokens(
        payload.sub,
        payload.email,
        payload.role,
        payload.institutionId,
      );

      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    await this.redis.del(`refresh:${userId}`);
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
    institutionId: string,
  ) {
    const payload = { sub: userId, email, role, institutionId };

    const accessToken = this.jwt.sign(payload);

    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRY', '7d'),
    });

    // Store refresh token in Redis (7 days TTL)
    await this.redis.set(`refresh:${userId}`, refreshToken, 7 * 24 * 60 * 60);

    return { accessToken, refreshToken };
  }
}
