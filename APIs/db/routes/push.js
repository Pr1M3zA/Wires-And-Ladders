import { Router } from 'express';
import { checkToken } from './gameboard.js';
 import * as webpush from 'web-push'

const routePush = Router();

routePush.get('/public-key', (_req, res) => {
  res.set('Cache-Control', 'no-store');
  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    return res.status(503).json({ message: 'Las notificaciones push no están configuradas.' });
  }

  return res.status(200).json({ publicKey });
});

routePush.post('/subscriptions', checkToken, async (req, res) => {
  try {
    await savePushSubscription(req.idUser, req.body);
    return res.status(201).json({ message: 'Suscripción guardada.' });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.status ? error.message : 'No se pudo guardar la suscripción push.',
    });
  }
});

routePush.delete('/subscriptions', checkToken, async (req, res) => {
  try {
    const endpoint = req.body?.endpoint;
    const result = await deletePushSubscription(req.idUser, endpoint);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.status ? error.message : 'No se pudo eliminar la suscripción push.',
    });
  }
});


/*  
    PUSH SERVICES
*/

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT;
let vapidConfigured = false;

if (vapidPublicKey && vapidPrivateKey && vapidSubject) {
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    vapidConfigured = true;
  } catch (error) {
    console.error('[push] Configuración VAPID inválida:', error.message);
  }
} else {
  console.warn('[push] Faltan VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY o VAPID_SUBJECT.');
}

export function getVapidPublicKey() {
  return vapidConfigured ? vapidPublicKey : null;
}

function invalidInput(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function validateSubscription(subscription) {
  const endpoint = subscription?.endpoint;
  const p256dh = subscription?.keys?.p256dh;
  const auth = subscription?.keys?.auth;

  if (typeof endpoint !== 'string' || endpoint.length > 2048) {
    throw invalidInput('Endpoint de suscripción inválido.');
  }
  try {
    if (new URL(endpoint).protocol !== 'https:') throw new Error('https requerido');
  } catch {
    throw invalidInput('El endpoint debe ser una URL HTTPS válida.');
  }
  if (typeof p256dh !== 'string' || !p256dh || p256dh.length > 255 ||
    typeof auth !== 'string' || !auth || auth.length > 255) {
    throw invalidInput('Claves de suscripción inválidas.');
  }

  return { endpoint, p256dh, auth };
}

async function savePushSubscription(userId, subscription) {
  const { endpoint, p256dh, auth } = validateSubscription(subscription);
  let db;
  try {
    db = await connect();
    await db.execute(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         user_id = VALUES(user_id),
         p256dh = VALUES(p256dh),
         auth = VALUES(auth)`,
      [userId, endpoint, p256dh, auth]
    );
  } finally {
    if (db) await db.end();
  }
}

async function deletePushSubscription(userId, endpoint) {
  if (typeof endpoint !== 'string' || endpoint.length > 2048) {
    throw invalidInput('Endpoint de suscripción inválido.');
  }

  let db;
  try {
    db = await connect();
    const [result] = await db.execute(
      'DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?',
      [userId, endpoint]
    );
    return { removed: result.affectedRows > 0 };
  } finally {
    if (db) await db.end();
  }
}

/** Best-effort delivery: one failing push service must not undo the domain action. */
export async function sendPushToUser(userId, message, { ttl = 3600 } = {}) {
  const result = { sent: 0, removed: 0, failed: 0 };
  if (!vapidConfigured) return { ...result, failed: 1 };

  let db;
  try {
    db = await connect();
    const [subscriptions] = await db.execute(
      'SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = ?',
      [userId]
    );

    const payload = JSON.stringify(message);
    await Promise.all(subscriptions.map(async (row) => {
      const subscription = {
        endpoint: row.endpoint,
        keys: { p256dh: row.p256dh, auth: row.auth },
      };

      try {
        await webpush.sendNotification(subscription, payload, {
          TTL: Math.max(0, Math.min(Number(ttl) || 3600, 2419200)),
          urgency: 'normal',
          timeout: 5000,
        });
        result.sent++;
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          try {
            const [deleted] = await db.execute(
              'DELETE FROM push_subscriptions WHERE endpoint = ?',
              [row.endpoint]
            );
            result.removed += deleted.affectedRows > 0 ? 1 : 0;
          } catch (deleteError) {
            result.failed++;
            console.warn('[push] No se pudo limpiar una suscripción vencida:', deleteError.message);
          }
          return;
        }

        // Incluye 429 y fallos transitorios: se conservan y se reportan para un próximo evento.
        result.failed++;
        console.warn(
          `[push] Falló el envío (${error.statusCode ?? error.code ?? 'sin código'}):`,
          error.body ?? error.message
        );
      }
    }));
  } catch (error) {
    result.failed++;
    console.warn('[push] No se pudo procesar el envío:', error.message);
  } finally {
    if (db) await db.end().catch((error) => {
      console.warn('[push] No se pudo cerrar la conexión:', error.message);
    });
  }

  return result;
}


export { routePush };
