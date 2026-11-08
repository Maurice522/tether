import type { APIRoute } from 'astro';

/**
 * Normally the service worker answers POST /share-target. This only runs if it isn't installed
 * yet (the very first share), where the payload can't be kept, so say so instead of a 404.
 */
export const POST: APIRoute = () => new Response(null, { status: 303, headers: { location: '/share?lost=1' } });
