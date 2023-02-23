import { createRouter } from "./trpc";
import { universityRouter } from "./university/university";

export const appRouter = createRouter({
  university: universityRouter
});

export type AppRouter = typeof appRouter;
