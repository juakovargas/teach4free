<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AddNoIndexForPrivateRoutes
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($this->shouldNoIndex($request)) {
            $response->headers->set('X-Robots-Tag', 'noindex, nofollow');
        }

        return $response;
    }

    private function shouldNoIndex(Request $request): bool
    {
        return $request->is(
            'admin',
            'admin/*',
            'dashboard',
            'profile/*',
            'settings/*',
            'teacher/*',
            'my-applications',
            'my-applications/*',
            'my-sessions',
            'my-sessions/*',
            'messages',
            'messages/*',
            'notifications',
            'notifications/*',
            'my-reports',
            'my-reports/*',
            'login',
            'register',
            'forgot-password',
            'reset-password',
            'reset-password/*',
            'email/verify',
            'email/verification-notification',
            'confirm-password',
            'two-factor-challenge',
            'auth/*',
            'support/report',
        );
    }
}
