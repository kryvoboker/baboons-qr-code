<script setup lang="ts">
const { draft, previewUrl, previewPending, setKind, syncData, preview, queuePreview } = useQrGenerator();
const savePending                                                                     = ref(false);
const saveError                                                                       = ref('');

watch(draft, queuePreview, { deep: true });
onMounted(() => {
    const pending = sessionStorage.getItem('baboons-pending-draft');
    if (pending) {
        try {
            draft.value = JSON.parse(pending);
            sessionStorage.removeItem('baboons-pending-draft');
        } catch {
            sessionStorage.removeItem('baboons-pending-draft');
        }
    } else {
        const template = sessionStorage.getItem('baboons-pending-template');
        if (template) {
            try {
                const parsed = JSON.parse(template) as {
                    kind?: typeof draft.value.kind;
                    design?: typeof draft.value.design;
                    name?: string;
                };
                if (parsed.kind) setKind(parsed.kind);
                if (parsed.design) draft.value.design = structuredClone(parsed.design);
                if (parsed.name) draft.value.name = parsed.name;
            } catch {
                // Ignore a damaged local template hand-off and keep the default draft.
            } finally {
                sessionStorage.removeItem('baboons-pending-template');
            }
        }
    }

    void preview();
});

const save = async () => {
    syncData();
    savePending.value = true;
    saveError.value   = '';

    try {
        const response = await $fetch<{
            data: {
                id: string
            }
        }>('/api/bff/v1/qr-codes', {
            method: 'POST',
            body:   {
                name:            draft.value.name,
                kind:            draft.value.kind,
                mode:            draft.value.mode,
                payload:         {
                    data:   draft.value.data,
                    fields: draft.value.fields,
                },
                design:          draft.value.design,
                folder_id:       draft.value.folderId,
                destination_url: draft.value.mode === 'dynamic' ? draft.value.destinationUrl : null,
            },
        });

        await navigateTo(`/qr-codes/${response.data.id}`);
    } catch (error: unknown) {
        const status = (error as {
            response?: {
                status?: number
            }
        })?.response?.status;

        if (status === 401) {
            sessionStorage.setItem('baboons-pending-draft', JSON.stringify(draft.value));
            await navigateTo('/auth/register?reason=save');
            return;
        }

        if (status === 422 && draft.value.mode === 'dynamic') {
            sessionStorage.setItem('baboons-pending-draft', JSON.stringify(draft.value));
            await navigateTo('/pricing?reason=dynamic');
            return;
        }

        saveError.value = 'Could not save this QR code. Check the content and try again.';
    } finally {
        savePending.value = false;
    }
};

const download = async () => {
    syncData();

    const blob = await $fetch<Blob>('/api/renderer/download', {
        method:       'POST',
        body:         {
            options: { ... draft.value.design, data: draft.value.data },
            format:  'png',
        },
        responseType: 'blob',
    });

    const url       = URL.createObjectURL(blob);
    const anchor    = document.createElement('a');
    anchor.href     = url;
    anchor.download = `${draft.value.name || 'qr-code'}.png`;
    anchor.click();
    URL.revokeObjectURL(url);
};
</script>

<template>
    <section id="generator">
        <div class="container">
            <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div class="mb-6">
                    <span class="badge badge-primary badge-soft">Free QR generator</span>
                    <h1 class="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                        Create a QR code without getting lost in settings
                    </h1>
                    <p class="text-base-content/60 mt-2 max-w-2xl">
                        Pick what it does, add content, choose a look. Advanced options stay out of the way until you need them.
                    </p>
                </div>

                <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
                    <div class="card border-base-content/10 bg-base-100 border">
                        <div class="card-body gap-7 p-4 sm:p-6">
                            <QrGeneratorTypePicker :model-value="draft.kind" @update:model-value="setKind"/>
                            <div class="divider my-0"/>
                            <QrGeneratorContentPanel v-model="draft"/>
                            <div class="divider my-0"/>
                            <QrGeneratorDesignPanel v-model="draft"/>

                            <div v-if="saveError" class="alert alert-error alert-soft text-sm">
                                <span class="icon-[tabler--alert-circle] size-5"/>
                                <span>{{ saveError }}</span>
                            </div>
                        </div>
                    </div>

                    <QrGeneratorPreviewCard
                        :draft="draft"
                        :preview-url="previewUrl"
                        :pending="previewPending || savePending"
                        @refresh="preview"
                        @save="save"
                        @download="download"
                    />
                </div>
            </div>
        </div>
    </section>
</template>