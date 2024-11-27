import { Prisma } from "@prisma/client";

// Generic interface for Prisma delegate methods
interface Delegate<T> {
    findFirst(args: Prisma.SelectSubset<Prisma.UserFindFirstArgs, T>): Promise<T | null>;
    findMany(args: Prisma.SelectSubset<Prisma.UserFindManyArgs, T>): Promise<T[]>;
    delete(args: Prisma.SelectSubset<Prisma.UserDeleteArgs, T>): Promise<T>;
    deleteMany(args: Prisma.SelectSubset<Prisma.UserDeleteManyArgs, T>): Promise<[]>;
    update(args: Prisma.SelectSubset<Prisma.UserUpdateArgs, T>): Promise<T>;
    updateMany(args: Prisma.SelectSubset<Prisma.UserUpdateManyArgs, T>): Promise<[]>;
    upsert(args: Prisma.SelectSubset<Prisma.UserUpsertArgs, T>): Promise<T>;
  }