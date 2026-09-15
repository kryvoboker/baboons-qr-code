import type { QrCornerDotStyle, QrCornerSquareStyle, QrDesign, QrDotStyle, QrKind } from '~/types/qr';

export const qrKinds: Array<{
    kind: QrKind;
    label: string;
    description: string;
    icon: string;
    dynamicFriendly: boolean;
}> = [
    { kind: 'url', label: 'Website', description: 'Open any link', icon: 'icon-[tabler--link]', dynamicFriendly: true },
    {
        kind: 'text',
        label: 'Text',
        description: 'Show plain text',
        icon: 'icon-[tabler--text-size]',
        dynamicFriendly: false,
    },
    {
        kind: 'wifi',
        label: 'Wi-Fi',
        description: 'Join a network',
        icon: 'icon-[tabler--wifi]',
        dynamicFriendly: false,
    },
    {
        kind: 'vcard',
        label: 'Contact',
        description: 'Save a vCard',
        icon: 'icon-[tabler--address-book]',
        dynamicFriendly: false,
    },
    {
        kind: 'email',
        label: 'Email',
        description: 'Compose an email',
        icon: 'icon-[tabler--mail]',
        dynamicFriendly: false,
    },
    {
        kind: 'phone',
        label: 'Phone',
        description: 'Start a call',
        icon: 'icon-[tabler--phone]',
        dynamicFriendly: false,
    },
    {
        kind: 'sms',
        label: 'SMS',
        description: 'Prepare a text',
        icon: 'icon-[tabler--message]',
        dynamicFriendly: false,
    },
    {
        kind: 'whatsapp',
        label: 'WhatsApp',
        description: 'Open a chat',
        icon: 'icon-[tabler--brand-whatsapp]',
        dynamicFriendly: true,
    },
    {
        kind: 'telegram',
        label: 'Telegram',
        description: 'Open Telegram',
        icon: 'icon-[tabler--brand-telegram]',
        dynamicFriendly: true,
    },
    {
        kind: 'location',
        label: 'Location',
        description: 'Open a map point',
        icon: 'icon-[tabler--map-pin]',
        dynamicFriendly: false,
    },
    {
        kind: 'event',
        label: 'Event',
        description: 'Calendar event',
        icon: 'icon-[tabler--calendar-event]',
        dynamicFriendly: false,
    },
    {
        kind: 'file',
        label: 'File / PDF',
        description: 'Link a document',
        icon: 'icon-[tabler--file-type-pdf]',
        dynamicFriendly: true,
    },
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

export const designPresets: Array<{
    id: string;
    name: string;
    description: string;
    shape: { dots: QrDotStyle; cornersSquare: QrCornerSquareStyle; cornersDot: QrCornerDotStyle };
}> = [
    {
        id: 'dots',
        name: 'Dots',
        description: 'Circular modules with rounded finder marks',
        shape: { dots: 'dots', cornersSquare: 'extra-rounded', cornersDot: 'dot' },
    },
    {
        id: 'square',
        name: 'Square',
        description: 'Classic square modules and finder marks',
        shape: { dots: 'square', cornersSquare: 'square', cornersDot: 'square' },
    },
    {
        id: 'rounded',
        name: 'Rounded',
        description: 'Soft rounded modules and finder marks',
        shape: { dots: 'rounded', cornersSquare: 'extra-rounded', cornersDot: 'dot' },
    },
    {
        id: 'classy',
        name: 'Classy',
        description: 'Decorative modules with crisp finder marks',
        shape: { dots: 'classy', cornersSquare: 'square', cornersDot: 'square' },
    },
];

export const socialLogos = [
    { id: 'x', name: 'X', path: '/images/social/x.svg', icon: 'icon-[tabler--brand-x]' },
    { id: 'telegram', name: 'Telegram', path: '/images/social/telegram.svg', icon: 'icon-[tabler--brand-telegram]' },
    { id: 'viber', name: 'Viber', path: '/images/social/viber.svg', icon: 'icon-[tabler--device-mobile-message]' },
    { id: 'youtube', name: 'YouTube', path: '/images/social/youtube.svg', icon: 'icon-[tabler--brand-youtube]' },
    { id: 'facebook', name: 'Facebook', path: '/images/social/facebook.svg', icon: 'icon-[tabler--brand-facebook]' },
    {
        id: 'instagram',
        name: 'Instagram',
        path: '/images/social/instagram.svg',
        icon: 'icon-[tabler--brand-instagram]',
    },
    { id: 'whatsapp', name: 'WhatsApp', path: '/images/social/whatsapp.svg', icon: 'icon-[tabler--brand-whatsapp]' },
];
