<?php

declare(strict_types=1);

namespace App\Models\Passport;

use Illuminate\Contracts\Auth\Authenticatable;
use Laravel\Passport\Client as BaseClient;
use Laravel\Passport\Scope;

final class Client extends BaseClient
{
    /** @param array<int, Scope> $scopes */
    public function skipsAuthorization(Authenticatable $user, array $scopes): bool
    {
        return $this->firstParty();
    }
}
