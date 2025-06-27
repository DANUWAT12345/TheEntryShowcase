import { createClient } from 'redis';

console.log('REDIS_PORT from env (raw):', process.env.REDIS_PORT); // Keep this line

const client = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10), // Keep this line
  }
});

// Move the console log here, outside the socket object
console.log('Parsed port (after parseInt):', parseInt(process.env.REDIS_PORT, 10));

client.on('connect', () => console.log('Redis connected'));
client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

await client.set('Test', 'Connection Success');
const result = await client.get('Test');
console.log(result)

export default client;
