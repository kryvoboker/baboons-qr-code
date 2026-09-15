<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

final class AuthRegistrationTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function valid_payload_creates_user_and_returns_created_response(): void
    {
        Notification::fake();

        $payload = [
            'name' => 'Registration Test User',
            'email' => 'registration-test@example.test',
            'password' => 'correct-horse-battery-staple',
            'password_confirmation' => 'correct-horse-battery-staple',
        ];

        $response = $this->withBffSecret()
            ->postJson('/api/v1/auth/register', $payload);

        $response->assertCreated()
            ->assertJsonPath('user.name', $payload['name'])
            ->assertJsonPath('user.email', $payload['email'])
            ->assertJsonMissingPath('user.password');

        $user = User::query()->where('email', $payload['email'])->firstOrFail();

        $this->assertModelExists($user);
        $this->assertNotSame($payload['password'], $user->password);
        $this->assertNull($user->email_verified_at);
        Notification::assertSentTo($user, VerifyEmail::class);
    }

    #[Test]
    public function empty_payload_returns_required_field_validation_errors(): void
    {
        $response = $this->withBffSecret()
            ->postJson('/api/v1/auth/register', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'password']);

        $this->assertDatabaseCount('users', 0);
    }

    #[Test]
    public function duplicate_email_returns_an_email_validation_error_without_creating_another_user(): void
    {
        $existing_user = User::factory()->create(['email' => 'existing-user@example.test']);

        $response = $this->withBffSecret()
            ->postJson('/api/v1/auth/register', [
                'name' => 'Another User',
                'email' => $existing_user->email,
                'password' => 'correct-horse-battery-staple',
                'password_confirmation' => 'correct-horse-battery-staple',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('email');

        $this->assertDatabaseCount('users', 1);
    }

    #[Test]
    public function mismatched_password_confirmation_returns_password_validation_error(): void
    {
        $response = $this->withBffSecret()
            ->postJson('/api/v1/auth/register', [
                'name' => 'Registration Test User',
                'email' => 'mismatch-test@example.test',
                'password' => 'correct-horse-battery-staple',
                'password_confirmation' => 'different-password',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('password');

        $this->assertDatabaseMissing('users', ['email' => 'mismatch-test@example.test']);
    }

    private function withBffSecret(): static
    {
        config(['baboons.bff_secret' => 'test-bff-secret']);

        return $this->withHeader('X-Baboons-BFF-Secret', 'test-bff-secret');
    }
}
