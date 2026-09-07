<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\User;

interface BillingGateway
{
    /** @return array{checkout_url:string, session_id:string} */
    public function createCheckout(User $user, string $planCode): array;
}
