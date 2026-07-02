export async function sendPushNotification(token, title, body, data = {}) {
  const serverKey = process.env.FIREBASE_SERVER_KEY;
  if (!token || !serverKey) {
    return { delivered: false, provider: 'firebase-cloud-messaging', reason: 'not-configured' };
  }

  const response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      Authorization: `key=${serverKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: token,
      notification: { title, body },
      data
    })
  });

  if (!response.ok) {
    const error = new Error(`Firebase push failed with status ${response.status}`);
    error.statusCode = 502;
    throw error;
  }

  return { delivered: true, provider: 'firebase-cloud-messaging', response: await response.json() };
}
