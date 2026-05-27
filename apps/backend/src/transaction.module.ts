import { Module, Controller, Post, Body, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TransactionController as CoreTxController } from '@tokens-taken/feature-transaction';

const prisma = new PrismaClient();
const coreController = new CoreTxController(prisma);

@Controller('transactions')
export class RestTransactionController {
  
  @Post()
  async create(@Body() body: any) {
    try {
      const org = await prisma.organization.findFirst();
      const user = await prisma.user.findFirst();
      if (!org || !user) {
        throw new HttpException(
          'Seed data not found. Run: pnpm db:seed',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }
      console.log('[POST /transactions] org:', org.id, 'user:', user.id, 'body:', JSON.stringify(body));
      const result = await coreController.createTransaction(org.id, user.id, body);
      return result;
    } catch (err: any) {
      console.error('[POST /transactions] ERROR:', err.message, err.stack);
      if (err instanceof HttpException) throw err;
      throw new HttpException(err.message || 'Unknown error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async list() {
    try {
      const org = await prisma.organization.findFirst();
      if (!org) {
        throw new HttpException(
          'Seed data not found. Run: pnpm db:seed',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }
      console.log('[GET /transactions] org:', org.id);
      const result = await coreController.listTransactions(org.id, {});
      return result;
    } catch (err: any) {
      console.error('[GET /transactions] ERROR:', err.message, err.stack);
      if (err instanceof HttpException) throw err;
      throw new HttpException(err.message || 'Unknown error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/approve')
  async approve(@Param('id') id: string, @Body() body: any) {
    try {
      const user = await prisma.user.findFirst();
      if (!user) {
        throw new HttpException(
          'Seed data not found. Run: pnpm db:seed',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }
      console.log('[POST /transactions/:id/approve]', id, body);
      const result = await coreController.approveTransaction(id, user.id, body);
      return result;
    } catch (err: any) {
      console.error('[POST /transactions/:id/approve] ERROR:', err.message, err.stack);
      if (err instanceof HttpException) throw err;
      throw new HttpException(err.message || 'Unknown error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Get('balances')
  async getLedgerBalances() {
    try {
      const org = await prisma.organization.findFirst();
      if (!org) {
        throw new HttpException(
          'Seed data not found. Run: pnpm db:seed',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }
      console.log('[GET /transactions/balances] org:', org.id);
      const result = await coreController.getLedgerBalances(org.id);
      return result;
    } catch (err: any) {
      console.error('[GET /transactions/balances] ERROR:', err.message, err.stack);
      if (err instanceof HttpException) throw err;
      throw new HttpException(err.message || 'Unknown error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

@Module({
  controllers: [RestTransactionController]
})
export class TransactionModule {}
