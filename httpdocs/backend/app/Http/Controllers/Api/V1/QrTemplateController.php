<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\QrCode;
use App\Models\QrTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class QrTemplateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(['data' => QrTemplate::query()->where('user_id', $request->user()->id)->latest()->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'kind' => ['required', 'string', 'max:40'],
            'design' => ['required', 'array'],
            'source_qr_code_id' => ['nullable', 'uuid'],
        ]);
        $template = QrTemplate::query()->create([...$data, 'user_id' => $request->user()->id]);
        return response()->json(['data' => $template], 201);
    }

    public function update(Request $request, QrTemplate $template): JsonResponse
    {
        abort_unless($template->user_id === $request->user()->id, 404);

        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'kind' => ['sometimes', 'required', 'string', 'max:40'],
            'design' => ['sometimes', 'required', 'array'],
        ]);

        $template->update($data);

        return response()->json(['data' => $template->fresh()]);
    }

    public function destroy(Request $request, QrTemplate $template): JsonResponse
    {
        abort_unless($template->user_id === $request->user()->id, 404);
        $template->delete();

        return response()->json(['ok' => true]);
    }

    public function fromQrCode(Request $request, QrCode $qrCode): JsonResponse
    {
        abort_unless($qrCode->user_id === $request->user()->id, 404);
        $name = $request->validate(['name' => ['required', 'string', 'max:120']])['name'];
        $template = QrTemplate::query()->create([
            'user_id' => $request->user()->id,
            'name' => $name,
            'kind' => $qrCode->kind,
            'design' => $qrCode->design,
            'preview_path' => $qrCode->image_path,
            'source_qr_code_id' => $qrCode->id,
        ]);
        return response()->json(['data' => $template], 201);
    }
}
