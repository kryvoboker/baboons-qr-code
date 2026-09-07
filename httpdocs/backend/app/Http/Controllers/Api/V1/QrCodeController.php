<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\QrCode;
use App\Services\Billing\DynamicQrEntitlement;
use App\Services\Qr\QrRendererClient;
use App\Services\Storage\UserStorageKey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

final class QrCodeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));
        $query = QrCode::query()
            ->where('user_id', $request->user()->id)
            ->with('folder')
            ->withCount('scans')
            ->latest();

        if ($search !== '') {
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'ilike', '%' . $search . '%')
                    ->orWhere('slug', 'ilike', '%' . $search . '%')
                    ->orWhere('destination_url', 'ilike', '%' . $search . '%');
            });
        }

        if ($request->filled('folder_id')) {
            $query->where('qr_folder_id', $request->integer('folder_id'));
        }

        if ($request->filled('mode') && in_array($request->query('mode'), ['static', 'dynamic'], true)) {
            $query->where('mode', $request->query('mode'));
        }

        return response()->json($query->paginate(24));
    }

    public function store(Request $request, QrRendererClient $renderer, DynamicQrEntitlement $entitlement): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'kind' => ['required', 'string', 'max:40'],
            'mode' => ['required', 'in:static,dynamic'],
            'payload' => ['required', 'array'],
            'design' => ['required', 'array'],
            'folder_id' => ['nullable', 'integer'],
            'destination_url' => ['nullable', 'url', 'max:2000'],
        ]);

        $user = $request->user();

        if ($data['mode'] === 'dynamic') {
            $entitlement->assertCanCreate($user);
        }

        if (($data['folder_id'] ?? null) !== null) {
            abort_unless($user->folders()->whereKey($data['folder_id'])->exists(), 422, 'Invalid folder.');
        }

        $slug = Str::lower(Str::random(8));
        $effectiveData = $data['mode'] === 'dynamic'
            ? rtrim((string) config('baboons.qr_redirect_base'), '/') . '/' . $slug
            : (string) ($data['payload']['data'] ?? $data['destination_url'] ?? '');

        $options = array_replace_recursive($data['design'], ['data' => $effectiveData]);
        $path = $renderer->renderAndSave(UserStorageKey::fromEmail($user->email), $options);

        $qr = QrCode::query()->create([
            'user_id' => $user->id,
            'qr_folder_id' => $data['folder_id'] ?? null,
            'name' => $data['name'],
            'slug' => $slug,
            'kind' => $data['kind'],
            'mode' => $data['mode'],
            'payload' => $data['payload'],
            'design' => $data['design'],
            'image_path' => $path,
            'destination_url' => $data['destination_url'] ?? null,
            'is_active' => true,
        ]);

        return response()->json(['data' => $qr], 201);
    }

    public function show(Request $request, QrCode $qrCode): JsonResponse
    {
        abort_unless($qrCode->user_id === $request->user()->id, 404);
        return response()->json(['data' => $qrCode->load('folder')->loadCount('scans')]);
    }

    public function update(Request $request, QrCode $qrCode, QrRendererClient $renderer): JsonResponse
    {
        abort_unless($qrCode->user_id === $request->user()->id, 404);
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'folder_id' => ['nullable', 'integer'],
            'payload' => ['sometimes', 'array'],
            'design' => ['sometimes', 'array'],
            'destination_url' => ['nullable', 'url', 'max:2000'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if (($data['folder_id'] ?? null) !== null) {
            abort_unless($request->user()->folders()->whereKey($data['folder_id'])->exists(), 422, 'Invalid folder.');
        }

        $qrCode->fill([
            'name' => $data['name'] ?? $qrCode->name,
            'qr_folder_id' => array_key_exists('folder_id', $data) ? $data['folder_id'] : $qrCode->qr_folder_id,
            'payload' => $data['payload'] ?? $qrCode->payload,
            'design' => $data['design'] ?? $qrCode->design,
            'destination_url' => array_key_exists('destination_url', $data) ? $data['destination_url'] : $qrCode->destination_url,
            'is_active' => $data['is_active'] ?? $qrCode->is_active,
        ]);

        if (isset($data['design']) || isset($data['payload'])) {
            $effectiveData = $qrCode->mode === 'dynamic'
                ? rtrim((string) config('baboons.qr_redirect_base'), '/') . '/' . $qrCode->slug
                : (string) (($qrCode->payload ?? [])['data'] ?? $qrCode->destination_url ?? '');
            $qrCode->image_path = $renderer->renderAndSave(
                UserStorageKey::fromEmail($request->user()->email),
                array_replace_recursive($qrCode->design ?? [], ['data' => $effectiveData]),
            );
        }

        $qrCode->save();
        Cache::forget('qr:redirect:' . $qrCode->slug);

        return response()->json(['data' => $qrCode->fresh()]);
    }

    public function destroy(Request $request, QrCode $qrCode): JsonResponse
    {
        abort_unless($qrCode->user_id === $request->user()->id, 404);
        Cache::forget('qr:redirect:' . $qrCode->slug);
        $qrCode->delete();

        return response()->json(status: 204);
    }
}
