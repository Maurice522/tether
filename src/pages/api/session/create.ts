import { digest, randomId, randomToken } from '../../../lib/crypto';
import { body, cleanName, cleanTag, json, rateLimit, route } from '../../../lib/http';
import { room } from '../../../lib/rooms';

export const POST = route(async (ctx) => {
  await rateLimit(ctx, 'create', 20, 10 * 60 * 1000);
  const b = await body(ctx);
  const name = cleanName(b.name);
  const tag = cleanTag(b.tag);

  const now = Date.now();
  const sid = randomId(8);
  const id = randomId(10);
  const token = randomToken();
  await room(sid).init(sid, { id, tokenHash: digest(token), name, tag, joinedAt: now, lastSeen: now });
  return json({ sessionId: sid, member: { id, token } }, 201);
});
