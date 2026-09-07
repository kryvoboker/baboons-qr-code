<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('qr_folders', function (Blueprint $table): void {
            $table->id(); $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name', 120); $table->timestamps();
            $table->unique(['user_id', 'name']);
        });
        Schema::create('qr_codes', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('qr_folder_id')->nullable()->constrained('qr_folders')->nullOnDelete();
            $table->string('name', 120); $table->string('slug', 16)->unique();
            $table->string('kind', 40); $table->string('mode', 16);
            $table->jsonb('payload'); $table->jsonb('design');
            $table->string('image_path')->nullable(); $table->text('destination_url')->nullable();
            $table->boolean('is_active')->default(true); $table->timestamp('last_scanned_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'created_at']); $table->index(['user_id', 'qr_folder_id']);
        });
        Schema::create('qr_templates', function (Blueprint $table): void {
            $table->id(); $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name', 120); $table->string('kind', 40); $table->jsonb('design');
            $table->string('preview_path')->nullable();
            $table->uuid('source_qr_code_id')->nullable();
            $table->foreign('source_qr_code_id')->references('id')->on('qr_codes')->nullOnDelete();
            $table->timestamps();
        });
        Schema::create('qr_scans', function (Blueprint $table): void {
            $table->bigIncrements('id'); $table->uuid('qr_code_id');
            $table->foreign('qr_code_id')->references('id')->on('qr_codes')->cascadeOnDelete();
            $table->timestamp('scanned_at')->index(); $table->string('ip_hash', 64)->nullable();
            $table->string('country', 2)->nullable(); $table->string('device', 40)->nullable();
            $table->string('browser', 80)->nullable(); $table->string('os', 80)->nullable();
            $table->text('referrer')->nullable(); $table->index(['qr_code_id', 'scanned_at']);
        });
        Schema::create('subscriptions', function (Blueprint $table): void {
            $table->id(); $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('plan_code', 32); $table->string('provider', 40); $table->string('provider_subscription_id')->nullable()->index();
            $table->string('status', 24)->index(); $table->timestamp('current_period_start')->nullable();
            $table->timestamp('current_period_end')->nullable()->index(); $table->boolean('cancel_at_period_end')->default(false);
            $table->timestamp('payment_failed_at')->nullable();
            $table->timestamp('renewal_reminder_sent_for')->nullable();
            $table->timestamp('payment_failure_notified_at')->nullable();
            $table->timestamps();
        });
        Schema::create('notifications', function (Blueprint $table): void {
            $table->uuid('id')->primary(); $table->string('type');
            $table->morphs('notifiable'); $table->text('data'); $table->timestamp('read_at')->nullable(); $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('notifications'); Schema::dropIfExists('subscriptions'); Schema::dropIfExists('qr_scans');
        Schema::dropIfExists('qr_templates'); Schema::dropIfExists('qr_codes'); Schema::dropIfExists('qr_folders');
    }
};
