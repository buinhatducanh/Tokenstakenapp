import { PrismaClient } from '@tokens-taken/db';
import type { Plugin } from 'vite';
import { TransactionService } from './transaction.service';

const prisma = new PrismaClient();

export function transactionApiPlugin(): Plugin {
  return {
    name: 'transaction-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // GET /api/transactions — Danh sách giao dịch
        if (req.url === '/api/transactions' && req.method === 'GET') {
            try {
              const transactions = await prisma.transaction.findMany({
                include: { journalEntries: true },
                orderBy: { date: 'desc' },
              });
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(transactions));
              return;
            } catch(e) {
                console.error(e);
                res.statusCode = 500;
                res.end(JSON.stringify({ message: "Internal server error" }));
                return;
            }
        }
        
        // GET /api/accounts — Danh sách tài khoản kế toán
        if (req.url === '/api/accounts' && req.method === 'GET') {
            try {
              const accounts = await prisma.account.findMany({
                orderBy: { code: 'asc' },
              });
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(accounts));
              return;
            } catch(e) {
                console.error(e);
                res.statusCode = 500;
                res.end(JSON.stringify({ message: "Internal server error" }));
                return;
            }
        }
        
        // POST /api/transactions — Tạo giao dịch mới
        if (req.url === '/api/transactions' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', async () => {
                try {
                    const data = JSON.parse(body);
                    // Lấy Organization thật từ DB
                    const org = await prisma.organization.findFirst({ where: { slug: 'demo-company' } });
                    if (!org) throw new Error('Organization not found. Hãy chạy pnpm db:seed trước!');
                    const transactionService = new TransactionService();
                    // userId = null vì chưa có auth context thật
                    const transaction = await transactionService.createTransaction(org.id, null, data);
                    res.setHeader('Content-Type', 'application/json');
                    res.statusCode = 201;
                    res.end(JSON.stringify({ success: true, data: transaction }));
                } catch(e: any) {
                    console.error(e);
                    res.setHeader('Content-Type', 'application/json');
                    res.statusCode = e.statusCode || 400;
                    res.end(JSON.stringify({ success: false, message: e.message }));
                }
            });
            return;
        }

        next();
      });
    },
  };
}
