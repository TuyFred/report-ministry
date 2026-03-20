// Use environment variable for API URL
// Production: Uses api.gnitafrica.com backend
// Development: Uses localhost
const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');

export const API_URL = import.meta.env.VITE_API_URL || 
    (isProduction ? 'https://api.gnitafrica.com' : 'http://localhost:5000');
