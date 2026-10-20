import type {Config, Context} from '@netlify/functions';
import {getDatabase} from '@netlify/database';
import {createOwnerApi} from '../lib/owner-api.mts';
import {postgresStorage} from '../lib/postgres.mts';
import seed from '../../portal_sync.json';

export default async (request: Request, context: Context) => {
  try {
    const db = getDatabase();
    const api = createOwnerApi({
      DB: postgresStorage(db.pool),
      CLASSROOM_OWNER_CREDENTIAL: Netlify.env.get('CLASSROOM_OWNER_CREDENTIAL'),
      CLASSROOM_OWNER_PASSWORD: Netlify.env.get('CLASSROOM_OWNER_PASSWORD')
    }, seed, work => context.waitUntil(work), {sameOrigin: true, clientIp: context.ip});
    return await api.fetch(request);
  } catch {
    // No database strings, private settings, or exception details reach visitors.
    return Response.json({error: 'The owner service is temporarily unavailable.'}, {
      status: 503, headers: {'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'}
    });
  }
};

export const config: Config = {path: ['/api/*', '/portal_sync.json']};
