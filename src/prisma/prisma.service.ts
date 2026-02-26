import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    const url = process.env.DATABASE_URL;
    if (!url || typeof url !== 'string' || url.trim() === '') {
      throw new Error(
        'DATABASE_URL is not set or is empty. Set DATABASE_URL (and DIRECT_URL) in your environment (e.g. Render Environment).',
      );
    }
    if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
      throw new Error(
        'DATABASE_URL must start with postgresql:// or postgres://. Check for typos or wrong variable (e.g. use Session pooler URL, not Prisma Accelerate URL).',
      );
    }
    const directUrl = process.env.DIRECT_URL;
    if (!directUrl || typeof directUrl !== 'string' || directUrl.trim() === '') {
      throw new Error(
        'DIRECT_URL is not set or is empty. Set DIRECT_URL in your environment (e.g. Render Environment). Use Supabase Direct connection (port 5432).',
      );
    }
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
