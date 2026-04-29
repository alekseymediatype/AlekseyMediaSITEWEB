import { createApp } from './app.js';
import { env } from './config/env.js';
import { db } from './lib/db.js';

const app = createApp();

async function start() {
  await db.query('SELECT 1');

  app.listen(env.PORT, () => {
    console.log(`AlekseyMedia store server running on ${env.APP_BASE_URL}`);
  });
}

start().catch((error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});
