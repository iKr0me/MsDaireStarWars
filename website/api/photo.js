import { createNotesService } from '../server/notes-service.js';

export const runtime = 'nodejs';
const service = createNotesService();
export const GET = request => service.getPhoto(request);
