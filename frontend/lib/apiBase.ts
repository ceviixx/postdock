export const serverApiBase =
  process.env.NODE_ENV === "production"
    ? "http://backend:8080"
    : "http://localhost:8080";


export const clientApiBase = 
    process.env.NODE_ENV === "production"
        ? "/api"
        : "http://localhost:8080/api";
