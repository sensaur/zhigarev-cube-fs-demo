import pino from "pino";
import { env } from "../config.js";

export const logger = pino({
  level:
    process.env.VITEST === "true"
      ? "silent"
      : env.NODE_ENV === "production"
        ? "info"
        : "debug",
});
