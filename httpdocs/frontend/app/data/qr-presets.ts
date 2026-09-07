import type { QrDesign, QrKind } from '~/types/qr';

export const qrKinds: Array<{ kind: QrKind; label: string; description: string; icon: string; dynamicFriendly: boolean }> = [
    { kind: 'url', label: 'Website', description: 'Open any link', icon: 'icon-[tabler--link]', dynamicFriendly: true },
    { kind: 'text', label: 'Text', description: 'Show plain text', icon: 'icon-[tabler--text-size]', dynamicFriendly: false },
    { kind: 'wifi', label: 'Wi-Fi', description: 'Join a network', icon: 'icon-[tabler--wifi]', dynamicFriendly: false },
    { kind: 'vcard', label: 'Contact', description: 'Save a vCard', icon: 'icon-[tabler--address-book]', dynamicFriendly: false },
    { kind: 'email', label: 'Email', description: 'Compose an email', icon: 'icon-[tabler--mail]', dynamicFriendly: false },
    { kind: 'phone', label: 'Phone', description: 'Start a call', icon: 'icon-[tabler--phone]', dynamicFriendly: false },
    { kind: 'sms', label: 'SMS', description: 'Prepare a text', icon: 'icon-[tabler--message]', dynamicFriendly: false },
    { kind: 'whatsapp', label: 'WhatsApp', description: 'Open a chat', icon: 'icon-[tabler--brand-whatsapp]', dynamicFriendly: true },
    { kind: 'telegram', label: 'Telegram', description: 'Open Telegram', icon: 'icon-[tabler--brand-telegram]', dynamicFriendly: true },
    { kind: 'location', label: 'Location', description: 'Open a map point', icon: 'icon-[tabler--map-pin]', dynamicFriendly: false },
    { kind: 'event', label: 'Event', description: 'Calendar event', icon: 'icon-[tabler--calendar-event]', dynamicFriendly: false },
    { kind: 'file', label: 'File / PDF', description: 'Link a document', icon: 'icon-[tabler--file-type-pdf]', dynamicFriendly: true },
];

export const defaultDesign: QrDesign = {
    width: 720,
    height: 720,
    type: 'svg',
    margin: 12,
    dotsOptions: { color: '#111827', type: 'rounded' },
    cornersSquareOptions: { color: '#111827', type: 'extra-rounded' },
    cornersDotOptions: { color: '#111827', type: 'dot' },
    backgroundOptions: { color: '#ffffff' },
    imageOptions: { crossOrigin: 'anonymous', margin: 8, hideBackgroundDots: true },
    qrOptions: { errorCorrectionLevel: 'H' },
};

export const designPresets: Array<{ id: string; name: string; description: string; design: Partial<QrDesign> }> = [
    { id: 'clean', name: 'Clean', description: 'Rounded black on white', design: {} },
    { id: 'soft', name: 'Soft', description: 'Dots with roomy corners', design: { dotsOptions: { color: '#334155', type: 'dots' } } },
    { id: 'night', name: 'Night', description: 'White code on dark', design: { dotsOptions: { color: '#ffffff', type: 'rounded' }, backgroundOptions: { color: '#111827' } } },
    { id: 'violet', name: 'Violet', description: 'Brand-friendly rounded style', design: { dotsOptions: { color: '#6d28d9', type: 'rounded' }, cornersSquareOptions: { color: '#4c1d95', type: 'extra-rounded' } } },
];

export const socialLogos = [
    { id: 'x', name: 'X', path: '/images/social/x.svg', icon: 'icon-[tabler--brand-x]' },
    { id: 'telegram', name: 'Telegram', path: '/images/social/telegram.svg', icon: 'icon-[tabler--brand-telegram]' },
    { id: 'viber', name: 'Viber', path: '/images/social/viber.svg', icon: 'icon-[tabler--brand-viber]' },
    { id: 'youtube', name: 'YouTube', path: '/images/social/youtube.svg', icon: 'icon-[tabler--brand-youtube]' },
    { id: 'facebook', name: 'Facebook', path: '/images/social/facebook.svg', icon: 'icon-[tabler--brand-facebook]' },
    { id: 'instagram', name: 'Instagram', path: '/images/social/instagram.svg', icon: 'icon-[tabler--brand-instagram]' },
    { id: 'whatsapp', name: 'WhatsApp', path: '/images/social/whatsapp.svg', icon: 'icon-[tabler--brand-whatsapp]' },
];
