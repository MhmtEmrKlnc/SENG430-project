import axios from 'axios';

// Build the base URL to point to our Django development server
// Assuming Django runs on port 8000 by default
const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
