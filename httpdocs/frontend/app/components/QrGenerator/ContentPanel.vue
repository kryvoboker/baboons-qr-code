<script setup lang="ts">
import type { QrDraft } from '~/types/qr';
import { dynamicKinds } from '~/utils/qr-content';

const props = withDefaults(defineProps<{ allowModeChange?: boolean }>(), { allowModeChange: true });
const draft = defineModel<QrDraft>({ required: true });
const canBeDynamic = computed(() => dynamicKinds.has(draft.value.kind));

watch(canBeDynamic, (allowed) => {
    if (!allowed && draft.value.mode === 'dynamic') draft.value.mode = 'static';
});
</script>

<template>
    <div>
        <h2 class="font-semibold">2. Add content</h2>
        <p class="text-base-content/60 mb-3 text-sm">
            Dynamic QR codes can change a web destination later; local payloads such as Wi‑Fi and vCard stay static.
        </p>

        <div class="grid gap-4">
            <label class="form-control">
                <span class="label-text mb-1">Name</span>
                <input v-model="draft.name" class="input" placeholder="e.g. Summer menu" />
            </label>

            <template v-if="draft.kind === 'url' || draft.kind === 'file'">
                <label class="form-control">
                    <span class="label-text mb-1">{{ draft.kind === 'file' ? 'Public file URL' : 'Website URL' }}</span>
                    <input v-model="draft.fields.url" class="input" type="url" placeholder="https://example.com" />
                </label>
            </template>

            <label v-else-if="draft.kind === 'text'" class="form-control">
                <span class="label-text mb-1">Text</span>
                <textarea
                    v-model="draft.fields.text"
                    class="textarea min-h-28"
                    placeholder="Text shown after scanning"
                />
            </label>

            <template v-else-if="draft.kind === 'wifi'">
                <div class="grid gap-4 sm:grid-cols-2">
                    <label class="form-control">
                        <span class="label-text mb-1">Network name (SSID)</span>
                        <input v-model="draft.fields.ssid" class="input" autocomplete="off" />
                    </label>
                    <label class="form-control">
                        <span class="label-text mb-1">Security</span>
                        <select v-model="draft.fields.security" class="select">
                            <option value="WPA">WPA / WPA2</option>
                            <option value="WEP">WEP</option>
                            <option value="nopass">No password</option>
                        </select>
                    </label>
                </div>
                <label class="form-control">
                    <span class="label-text mb-1">Password</span>
                    <input v-model="draft.fields.password" class="input" autocomplete="new-password" />
                </label>
                <label class="flex cursor-pointer items-center gap-3">
                    <input v-model="draft.fields.hidden" type="checkbox" class="checkbox checkbox-primary" />
                    <span class="text-sm">Hidden network</span>
                </label>
            </template>

            <template v-else-if="draft.kind === 'vcard'">
                <div class="grid gap-4 sm:grid-cols-2">
                    <label class="form-control">
                        <span class="label-text mb-1">Full name</span>
                        <input v-model="draft.fields.name" class="input" />
                    </label>
                    <label class="form-control">
                        <span class="label-text mb-1">Company</span>
                        <input v-model="draft.fields.organization" class="input" />
                    </label>
                    <label class="form-control">
                        <span class="label-text mb-1">Phone</span>
                        <input v-model="draft.fields.phone" class="input" type="tel" />
                    </label>
                    <label class="form-control">
                        <span class="label-text mb-1">Email</span>
                        <input v-model="draft.fields.email" class="input" type="email" />
                    </label>
                </div>
                <label class="form-control">
                    <span class="label-text mb-1">Website</span>
                    <input v-model="draft.fields.website" class="input" type="url" />
                </label>
            </template>

            <template v-else-if="draft.kind === 'email'">
                <label class="form-control">
                    <span class="label-text mb-1">Recipient</span>
                    <input v-model="draft.fields.to" class="input" type="email" />
                </label>
                <label class="form-control">
                    <span class="label-text mb-1">Subject</span>
                    <input v-model="draft.fields.subject" class="input" />
                </label>
                <label class="form-control">
                    <span class="label-text mb-1">Message</span>
                    <textarea v-model="draft.fields.body" class="textarea min-h-24" />
                </label>
            </template>

            <label v-else-if="draft.kind === 'phone'" class="form-control">
                <span class="label-text mb-1">Phone number</span>
                <input v-model="draft.fields.phone" class="input" type="tel" placeholder="+380..." />
            </label>

            <template v-else-if="draft.kind === 'sms' || draft.kind === 'whatsapp'">
                <label class="form-control">
                    <span class="label-text mb-1">Phone number</span>
                    <input v-model="draft.fields.phone" class="input" type="tel" placeholder="+380..." />
                </label>
                <label class="form-control">
                    <span class="label-text mb-1">Prefilled message</span>
                    <textarea v-model="draft.fields.message" class="textarea min-h-24" />
                </label>
            </template>

            <label v-else-if="draft.kind === 'telegram'" class="form-control">
                <span class="label-text mb-1">Telegram username</span>
                <div class="input flex items-center gap-2">
                    <span class="text-base-content/50">@</span>
                    <input v-model="draft.fields.username" class="grow" placeholder="username" />
                </div>
            </label>

            <template v-else-if="draft.kind === 'location'">
                <div class="grid gap-4 sm:grid-cols-2">
                    <label class="form-control">
                        <span class="label-text mb-1">Latitude</span>
                        <input v-model="draft.fields.latitude" class="input" inputmode="decimal" placeholder="50.4501" />
                    </label>
                    <label class="form-control">
                        <span class="label-text mb-1">Longitude</span>
                        <input v-model="draft.fields.longitude" class="input" inputmode="decimal" placeholder="30.5234" />
                    </label>
                </div>
            </template>

            <template v-else-if="draft.kind === 'event'">
                <label class="form-control">
                    <span class="label-text mb-1">Event title</span>
                    <input v-model="draft.fields.title" class="input" />
                </label>
                <div class="grid gap-4 sm:grid-cols-2">
                    <label class="form-control">
                        <span class="label-text mb-1">Starts</span>
                        <input v-model="draft.fields.startsAt" class="input" type="datetime-local" />
                    </label>
                    <label class="form-control">
                        <span class="label-text mb-1">Ends</span>
                        <input v-model="draft.fields.endsAt" class="input" type="datetime-local" />
                    </label>
                </div>
                <label class="form-control">
                    <span class="label-text mb-1">Location</span>
                    <input v-model="draft.fields.location" class="input" />
                </label>
            </template>

            <div class="join w-full">
                <label class="join-item border-base-content/10 flex flex-1 cursor-pointer items-center gap-3 border p-3">
                    <input v-model="draft.mode" type="radio" value="static" class="radio radio-primary" :disabled="!props.allowModeChange" />
                    <span>
                        <span class="block text-sm font-medium">Static · Free</span>
                        <span class="text-base-content/60 text-xs">Content is encoded permanently</span>
                    </span>
                </label>

                <label
                    :class="[
                        'join-item border-base-content/10 flex flex-1 items-center gap-3 border p-3',
                        canBeDynamic && props.allowModeChange ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
                    ]"
                >
                    <input
                        v-model="draft.mode"
                        type="radio"
                        value="dynamic"
                        class="radio radio-primary"
                        :disabled="!canBeDynamic || !props.allowModeChange"
                    />
                    <span>
                        <span class="flex items-center gap-2 text-sm font-medium">
                            Dynamic
                            <span class="badge badge-primary badge-xs">PRO</span>
                        </span>
                        <span class="text-base-content/60 text-xs">
                            {{ !props.allowModeChange ? 'Mode is fixed after creation' : canBeDynamic ? 'Change destination + track scans' : 'Not needed for this QR type' }}
                        </span>
                    </span>
                </label>
            </div>
        </div>
    </div>
</template>
