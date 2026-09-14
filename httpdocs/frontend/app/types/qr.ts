export type QrMode = 'static' | 'dynamic';
export type QrKind =
    | 'url'
    | 'text'
    | 'wifi'
    | 'vcard'
    | 'email'
    | 'phone'
    | 'sms'
    | 'whatsapp'
    | 'telegram'
    | 'location'
    | 'event'
    | 'file';

export type QrDotStyle = 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded';
export type QrCornerDotStyle = 'dot' | 'square' | QrDotStyle;
export type QrCornerSquareStyle = 'dot' | 'square' | 'extra-rounded' | QrDotStyle;

export interface QrDesign {
    width: number;
    height: number;
    type: 'svg' | 'canvas';
    margin: number;
    dotsOptions: { color: string; type: QrDotStyle };
    cornersSquareOptions: { color: string; type: QrCornerSquareStyle };
    cornersDotOptions: { color: string; type: QrCornerDotStyle };
    backgroundOptions: { color: string };
    image?: string;
    imageOptions: { crossOrigin: 'anonymous'; margin: number; hideBackgroundDots: boolean };
    qrOptions: { errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' };
}

export type QrFields = Record<string, string | boolean>;

export interface QrDraft {
    name: string;
    kind: QrKind;
    mode: QrMode;
    fields: QrFields;
    data: string;
    destinationUrl: string;
    folderId?: number;
    design: QrDesign;
}

export interface QrListItem {
    id: string;
    name: string;
    kind: QrKind;
    mode: QrMode;
    folder: string;
    scans: number;
    updatedAt: string;
    previewUrl: string;
    destination: string;
    active: boolean;
}
