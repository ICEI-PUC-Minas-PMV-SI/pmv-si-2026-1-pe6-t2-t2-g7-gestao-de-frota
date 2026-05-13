const fallback = "http://10.0.2.2:3030";

export const constants = {
  API_BASE: process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") || fallback,
};
