<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $supportedLocales = array_keys(config('app.supported_locales', []));
        $fallbackLocale = config('app.locale', 'en');
        $locale = $request->user()?->preferred_locale ?: $request->session()->get('locale', $fallbackLocale);

        if (! in_array($locale, $supportedLocales, true)) {
            $locale = $fallbackLocale;
        }

        App::setLocale($locale);

        return $next($request);
    }
}
