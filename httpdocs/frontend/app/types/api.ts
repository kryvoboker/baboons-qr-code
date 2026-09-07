import type { QrDesign, QrKind, QrMode } from '~/types/qr';

export interface ApiQrCode {
    id: string;
    name: string;
    kind: QrKind;
    mode: QrMode;
    slug: string;
    payload: { data?: string; fields?: Record<string, string | boolean> };
    design: QrDesign;
    image_path: string | null;
    destination_url: string | null;
    is_active: boolean;
    scans_count?: number;
    updated_at: string;
    folder?: { id: number; name: string } | null;
    qr_folder_id?: number | null;
}

export interface ApiFolder {
    id: number;
    name: string;
    qr_codes_count?: number;
}

export interface ApiQrTemplate {
    id: number;
    name: string;
    kind: QrKind;
    design: QrDesign;
    preview_path: string | null;
    source_qr_code_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface ApiNotification {
    id: string;
    type: string;
    data: Record<string, unknown>;
    read_at: string | null;
    created_at: string;
}

export interface ApiSubscription {
    id: number;
    plan_code: string;
    provider: string;
    provider_subscription_id: string | null;
    status: string;
    current_period_start: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    payment_failed_at: string | null;
}

export interface ApiPlan {
    code: string;
    name: string;
    price: number;
    currency: string;
    dynamic_qr: number;
    scans: number;
}

export interface ApiUser {
    id: number;
    name: string;
    email: string;
    timezone: string;
    locale: string;
}

export interface DashboardData {
    dynamic_qr_count: number;
    dynamic_qr_limit: number | null;
    scans_this_month: number;
    scan_limit: number | null;
    templates_count: number;
    folders_count: number;
    daily: Array<{ date: string; scans: number | string }>;
    recent_qr_codes: ApiQrCode[];
    subscription: ApiSubscription | null;
    plan: ApiPlan | null;
}
