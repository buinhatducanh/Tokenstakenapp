import { Module } from "@nestjs/common";
import { TransactionModule } from "./transaction.module";
import { ReportsModule } from "./reports.module";

@Module({
  imports: [TransactionModule, ReportsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
