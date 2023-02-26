import { Prisma, PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { universitySchema } from "prisma-gen";
import { createRouter, baseProcedure } from "../trpc";
import { campusRouter } from "./campus/campus";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/data-proxy";

export const universityRouter = createRouter({
    campus: campusRouter,
    add: baseProcedure
        .input(
            universitySchema
                .pick({ name: true })
                .extend({ name: z.string().min(4).max(100) })
        )
        .mutation(async ({ input, ctx }) => {
            try {
                return await ctx.prisma.university.create({
                    data: {
                        id: nanoid(),
                        name: input.name,
                    },
                });
            } catch (e) {
                if (
                    e instanceof PrismaClientKnownRequestError &&
                    e.code === "P2002"
                ) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "University already exists",
                    });
                }
            }
        }),
    remove: baseProcedure
        .input(universitySchema.pick({ id: true }))
        .mutation(async ({ input, ctx }) => {
            return await ctx.prisma.university.delete({
                where: { id: input.id },
            });
        }),
    getAll: baseProcedure.query(async ({ ctx }) => {
        return await ctx.prisma.university.findMany();
    }),
});
