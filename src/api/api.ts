import axios from "axios";

// export const api = axios.create({
//   baseURL: `${import.meta.env.VITE_API_URL}/api`,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

export const api = axios.create({
  baseURL: 'http://localhost:8000/api',  // Altere para o seu endpoint correto
  headers: {
    "Content-Type": "application/json",
  },
});
