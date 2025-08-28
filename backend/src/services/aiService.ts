import axios from 'axios';

const aiService = axios.create({
  baseURL: process.env.AI_SERVICE_URL,
  headers: { 'X-Internal-Token': process.env.AI_INTERNAL_TOKEN || '' },
  timeout: 10000,
});

export default aiService;


