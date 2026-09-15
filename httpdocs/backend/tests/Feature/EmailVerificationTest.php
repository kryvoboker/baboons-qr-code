<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use Laravel\Passport\Passport;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

final class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function signed_link_verifies_email_after_the_guest_authenticates(): void
    {
        $user = User::factory()->unverified()->create();
        $verificationUrl = $this->verificationUrl($user);

        $this->get($verificationUrl)
            ->assertRedirect(route('login', ['redirect' => $verificationUrl]));

        $this->withSession(['_token' => 'test-csrf-token'])
            ->post('/login', [
                'email' => $user->email,
                'password' => 'password',
                'redirect' => $verificationUrl,
                '_token' => 'test-csrf-token',
            ])->assertRedirect($verificationUrl);

        $this->get($verificationUrl)
            ->assertRedirect(rtrim((string) config('baboons.frontend_url'), '/').'/auth/verify-email?verified=1');

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    #[Test]
    public function signed_link_cannot_verify_an_email_with_a_mismatched_hash(): void
    {
        $user = User::factory()->unverified()->create();
        $verificationUrl = URL::temporarySignedRoute('verification.verify', now()->addMinutes(30), [
            'id' => $user->getKey(),
            'hash' => sha1('different@example.test'),
        ]);

        $this->actingAs($user, 'web')
            ->get($verificationUrl)
            ->assertForbidden();

        $this->assertNull($user->fresh()->email_verified_at);
    }

    #[Test]
    public function unverified_user_is_forbidden_from_protected_api_routes(): void
    {
        config(['baboons.bff_secret' => 'test-bff-secret']);
        $user = User::factory()->unverified()->create();
        Passport::actingAs($user, ['profile:read']);

        $this->withHeader('X-Baboons-BFF-Secret', 'test-bff-secret')
            ->getJson('/api/v1/auth/user')
            ->assertForbidden();
    }

    #[Test]
    public function verified_user_can_access_protected_api_routes(): void
    {
        config(['baboons.bff_secret' => 'test-bff-secret']);
        $user = User::factory()->create();
        Passport::actingAs($user, ['profile:read']);

        $this->withHeader('X-Baboons-BFF-Secret', 'test-bff-secret')
            ->getJson('/api/v1/auth/user')
            ->assertOk()
            ->assertJsonPath('user.email', $user->email);
    }

    private function verificationUrl(User $user): string
    {
        return URL::temporarySignedRoute('verification.verify', now()->addMinutes(30), [
            'id' => $user->getKey(),
            'hash' => sha1($user->getEmailForVerification()),
        ]);
    }
}
