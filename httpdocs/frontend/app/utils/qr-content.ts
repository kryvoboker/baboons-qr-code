import type { QrDraft, QrFields, QrKind } from '~/types/qr';

const field = (fields: QrFields, key: string): string => String(fields[key] ?? '').trim();

const escapeWifi = (value: string): string => value.replace(/([\\;,:"'])/g, '\\$1');
const escapeVcard = (value: string): string => value.replace(/([\\,;])/g, '\\$1').replace(/\n/g, '\\n');

const calendarDate = (value: string): string => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return date
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}Z$/, 'Z');
};

export const defaultFieldsFor = (kind: QrKind): QrFields => {
    switch (kind) {
        case 'url':
            return { url: 'https://example.com' };
        case 'text':
            return { text: 'Hello from Baboons QR-code' };
        case 'wifi':
            return { ssid: '', password: '', security: 'WPA', hidden: false };
        case 'vcard':
            return { name: '', phone: '', email: '', organization: '', website: '' };
        case 'email':
            return { to: '', subject: '', body: '' };
        case 'phone':
            return { phone: '' };
        case 'sms':
            return { phone: '', message: '' };
        case 'whatsapp':
            return { phone: '', message: '' };
        case 'telegram':
            return { username: '' };
        case 'location':
            return { latitude: '', longitude: '' };
        case 'event':
            return { title: '', startsAt: '', endsAt: '', location: '' };
        case 'file':
            return { url: 'https://example.com/document.pdf' };
    }
};

export const dynamicKinds: ReadonlySet<QrKind> = new Set(['url', 'file', 'whatsapp', 'telegram']);

export const buildQrData = (draft: Pick<QrDraft, 'kind' | 'fields'>): string => {
    const fields = draft.fields;

    switch (draft.kind) {
        case 'url':
        case 'file':
            return field(fields, 'url');

        case 'text':
            return String(fields.text ?? '');

        case 'wifi': {
            const security = field(fields, 'security') || 'WPA';
            const hidden = fields.hidden === true ? 'true' : 'false';
            return `WIFI:T:${escapeWifi(security)};S:${escapeWifi(field(fields, 'ssid'))};P:${escapeWifi(field(fields, 'password'))};H:${hidden};;`;
        }

        case 'vcard': {
            const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${escapeVcard(field(fields, 'name'))}`];

            if (field(fields, 'organization')) lines.push(`ORG:${escapeVcard(field(fields, 'organization'))}`);
            if (field(fields, 'phone')) lines.push(`TEL:${escapeVcard(field(fields, 'phone'))}`);
            if (field(fields, 'email')) lines.push(`EMAIL:${escapeVcard(field(fields, 'email'))}`);
            if (field(fields, 'website')) lines.push(`URL:${escapeVcard(field(fields, 'website'))}`);

            lines.push('END:VCARD');
            return lines.join('\n');
        }

        case 'email': {
            const params = new URLSearchParams();
            if (field(fields, 'subject')) params.set('subject', field(fields, 'subject'));
            if (field(fields, 'body')) params.set('body', field(fields, 'body'));
            const query = params.toString();
            return `mailto:${field(fields, 'to')}${query ? `?${query}` : ''}`;
        }

        case 'phone':
            return `tel:${field(fields, 'phone')}`;

        case 'sms':
            return `SMSTO:${field(fields, 'phone')}:${String(fields.message ?? '')}`;

        case 'whatsapp': {
            const phone = field(fields, 'phone').replace(/\D/g, '');
            const message = String(fields.message ?? '').trim();
            return `https://wa.me/${phone}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
        }

        case 'telegram':
            return `https://t.me/${field(fields, 'username').replace(/^@/, '')}`;

        case 'location':
            return `geo:${field(fields, 'latitude')},${field(fields, 'longitude')}`;

        case 'event': {
            const lines = [
                'BEGIN:VEVENT',
                `SUMMARY:${escapeVcard(field(fields, 'title'))}`,
                `DTSTART:${calendarDate(field(fields, 'startsAt'))}`,
                `DTEND:${calendarDate(field(fields, 'endsAt'))}`,
            ];

            if (field(fields, 'location')) lines.push(`LOCATION:${escapeVcard(field(fields, 'location'))}`);
            lines.push('END:VEVENT');
            return lines.join('\n');
        }
    }
};
