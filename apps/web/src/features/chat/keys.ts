export const chatKeys = {
  all: ["chat"] as const,
  models: () => [...chatKeys.all, "models"] as const,
};
