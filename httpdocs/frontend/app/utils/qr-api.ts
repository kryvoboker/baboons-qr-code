import type { ApiQrCode } from '~/types/api';
import type { QrListItem } from '~/types/qr';

export const toQrListItem = (qr: ApiQrCode, storageBase: string): QrListItem => ({
    id: qr.id,
    name: qr.name,
    kind: qr.kind,
    mode: qr.mode,
    folder: qr.folder?.name || 'Unfiled',
    scans: Number(qr.scans_count || 0),
    updatedAt: new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(qr.updated_at)),
    previewUrl: qr.image_path ? `${storageBase}/${qr.image_path}` : '/images/demo/qr-1.svg',
    destination: qr.destination_url || String(qr.payload?.data || ''),
    active: qr.is_active,
});
