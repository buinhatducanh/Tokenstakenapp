"use strict";
// Re-export PrismaClient + Prisma types for use across the monorepo
// All packages should import from here, not directly from @prisma/client
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaModule = exports.PrismaService = exports.PrismaClient = void 0;
var client_1 = require("@prisma/client");
Object.defineProperty(exports, "PrismaClient", { enumerable: true, get: function () { return client_1.PrismaClient; } });
var prisma_service_1 = require("./prisma.service");
Object.defineProperty(exports, "PrismaService", { enumerable: true, get: function () { return prisma_service_1.PrismaService; } });
var prisma_module_1 = require("./prisma.module");
Object.defineProperty(exports, "PrismaModule", { enumerable: true, get: function () { return prisma_module_1.PrismaModule; } });
