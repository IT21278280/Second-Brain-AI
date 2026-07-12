export const logger = {
  info: (...args: unknown[]) => {
    console.info("[second-brain-ai]", ...args);
  },
  warn: (...args: unknown[]) => {
    console.warn("[second-brain-ai]", ...args);
  },
  error: (...args: unknown[]) => {
    console.error("[second-brain-ai]", ...args);
  },
};
