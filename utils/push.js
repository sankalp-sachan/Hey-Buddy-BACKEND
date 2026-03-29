import webpush from 'web-push';
import dotenv from 'dotenv';
dotenv.config();

// You should generate these with npx web-push generate-vapid-keys and save them in .env
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BC_ZAygRbMJzdbI-a577GFIG0BYttDgeLPZes5ijkOcCh6U_gfabOeFVSjANscvH9lh4ZUdzAjNj7l4w7u-rPJs',
  privateKey: process.env.VAPID_PRIVATE_KEY || '6J1xxQZisyOgfB7ZOecsOJY2TniDLlNCAu1xctrgWy0'
};

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:sankalpsachan2007@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export const sendPushNotification = async (subscription, data) => {
  if (!subscription) return;
  
  try {
    await webpush.sendNotification(subscription, JSON.stringify(data));
  } catch (error) {
    console.error('Push notification error:', error);
  }
};
