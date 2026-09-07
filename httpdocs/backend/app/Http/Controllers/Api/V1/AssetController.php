<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\Storage\UserStorageKey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

final class AssetController extends Controller
{
    public function logo(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => ['required', 'file', 'mimes:png,jpg,jpeg,webp', 'max:2048'],
            'guest_session_key' => ['nullable', 'string', 'min:32', 'max:200'],
        ]);

        $user = $request->user('api');
        abort_if($user === null && ! $request->filled('guest_session_key'), 422, 'Guest session key is required.');

        $storageKey = $user !== null
            ? UserStorageKey::fromEmail((string) $user->email)
            : UserStorageKey::fromGuestSession((string) $request->input('guest_session_key'));

        $now = now();
        $extension = Str::lower((string) $request->file('logo')->extension());
        $filename = Str::uuid()->toString() . '.' . $extension;
        $relative = sprintf(
            'images/qr-code/%s/%s/%s/%s',
            $storageKey,
            $now->format('Y'),
            $now->format('m'),
            $filename,
        );

        Storage::disk('public')->putFileAs(dirname($relative), $request->file('logo'), basename($relative));

        return response()->json([
            'data' => [
                'relative_path' => $relative,
                'url' => rtrim((string) config('baboons.storage_public_url'), '/') . '/' . $relative,
            ],
        ], 201);
    }
}
