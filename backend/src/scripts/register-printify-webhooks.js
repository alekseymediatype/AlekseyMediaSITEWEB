import { env } from '../config/env.js';
import { createPrintifyWebhook, listPrintifyWebhooks } from '../lib/printify.js';

const topics = [
  'order:created',
  'order:updated',
  'order:shipment:created',
  'order:shipment:delivered',
  'order:sent-to-production',
];

const webhookUrl = `${env.APP_BASE_URL}/api/webhooks/printify?token=${encodeURIComponent(env.PRINTIFY_WEBHOOK_TOKEN)}`;

async function main() {
  const existing = await listPrintifyWebhooks();
  const existingPairs = new Set((existing || []).map((item) => `${item.topic}::${item.url}`));

  for (const topic of topics) {
    const key = `${topic}::${webhookUrl}`;
    if (existingPairs.has(key)) {
      console.log(`Skipping existing webhook ${topic}`);
      continue;
    }

    const created = await createPrintifyWebhook({
      topic,
      url: webhookUrl,
    });

    console.log(`Created webhook ${topic}:`, created.id);
  }
}

main().catch((error) => {
  console.error('Failed to register Printify webhooks:', error);
  process.exit(1);
});
