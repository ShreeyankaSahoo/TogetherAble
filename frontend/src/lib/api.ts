export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://togetherable-backend1.onrender.com";

export const apiUrl = (path: string) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
