import { defaultDesign } from '~/data/qr-presets';
import type { QrDraft, QrImageFormat, QrKind } from '~/types/qr';
import { buildQrData, defaultFieldsFor, dynamicKinds } from '~/utils/qr-content';

const createDraft = (): QrDraft => {
    const fields = defaultFieldsFor('url');

    return {
        name: 'My QR code',
        kind: 'url',
        mode: 'static',
        fields,
        data: buildQrData({ kind: 'url', fields }),
        destinationUrl: 'https://example.com',
        design: structuredClone(defaultDesign),
    };
};

export const useQrGenerator = () => {
    const draft = useState<QrDraft>('qr-draft', createDraft);
    const previewUrl = useState<string>('qr-preview-url', () => '');
    const previewPending = useState<boolean>('qr-preview-pending', () => false);
    const imageFormat = useState<QrImageFormat>('qr-image-format', () => 'svg');
    let timer: ReturnType<typeof setTimeout> | undefined;

    const syncData = () => {
        draft.value.data = buildQrData(draft.value);
        draft.value.destinationUrl = dynamicKinds.has(draft.value.kind) ? draft.value.data : '';

        if (!dynamicKinds.has(draft.value.kind) && draft.value.mode === 'dynamic') {
            draft.value.mode = 'static';
        }
    };

    const setKind = (kind: QrKind) => {
        draft.value.kind = kind;
        draft.value.fields = defaultFieldsFor(kind);
        syncData();
    };

    const preview = async () => {
        if (!import.meta.client) return;
        previewPending.value = true;

        try {
            syncData();
            const blob = await $fetch<Blob>('/api/renderer/preview', {
                method: 'POST',
                body: {
                    options: {
                        ...draft.value.design,
                        data: draft.value.mode === 'dynamic' ? 'https://q.example/r/demo' : draft.value.data,
                    },
                    format: imageFormat.value,
                },
                responseType: 'blob',
            });

            if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
            previewUrl.value = URL.createObjectURL(blob);
        } finally {
            previewPending.value = false;
        }
    };

    const queuePreview = () => {
        syncData();
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => void preview(), 180);
    };

    return {
        draft,
        previewUrl,
        previewPending,
        imageFormat,
        setKind,
        syncData,
        preview,
        queuePreview,
    };
};
