<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\QrFolder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class QrFolderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'data' => QrFolder::query()
                ->where('user_id', $request->user()->id)
                ->withCount('qrCodes')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:120']]);
        $folder = QrFolder::query()->create(['user_id' => $request->user()->id, 'name' => $data['name']]);

        return response()->json(['data' => $folder], 201);
    }

    public function update(Request $request, QrFolder $folder): JsonResponse
    {
        abort_unless($folder->user_id === $request->user()->id, 404);
        $data = $request->validate(['name' => ['required', 'string', 'max:120']]);
        $folder->update($data);

        return response()->json(['data' => $folder]);
    }

    public function destroy(Request $request, QrFolder $folder): JsonResponse
    {
        abort_unless($folder->user_id === $request->user()->id, 404);
        $folder->delete();

        return response()->json(status: 204);
    }
}
