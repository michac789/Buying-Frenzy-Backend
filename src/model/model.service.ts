import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const PROD = true;
// in real production env, hide this in environment variable
const DB_URL = PROD
  ? 'postgres://postgres:Mich1907%23@mydatabase.cubkol3kj008.ap-southeast-1.rds.amazonaws.com/initialdb?schema=public&pool_timeout=0&connection_limit=5'
  : 'postgresql://postgres:postgres@localhost:5432/postgres?schema=public&pool_timeout=0&connection_limit=5';

@Injectable()
export class ModelService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          // for real production, put this in prod environment!
          url: DB_URL,
        },
      },
    });
  }

  cleanDb() {
    return this.$transaction([
      this.restaurant.deleteMany(),
      this.user.deleteMany(),
    ]);
  }
}
