export const getDBTimestamps = (
  createdAt: boolean = false,
  updatedAt: boolean = true,
) => {
  const now = new Date();

  return {
    ...(createdAt && { createdAt: now }),
    ...(updatedAt && { updatedAt: now }),
  };
};
