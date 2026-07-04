import { z } from "zod";

export const markNotificationReadSchema = z.object({
  id: z.string().min(1, "Missing notification id."),
});
