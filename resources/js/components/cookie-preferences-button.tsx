import type { ButtonHTMLAttributes } from 'react';

import { useTranslation } from '@/hooks/use-translation';
import { openCookiePreferences } from '@/lib/cookie-consent';
import { cn } from '@/lib/utils';

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export function CookiePreferencesButton({ className, onClick, ...props }: Props) {
    const { t } = useTranslation();

    return (
        <button
            type="button"
            className={cn('text-left text-sm transition', className)}
            onClick={(event) => {
                onClick?.(event);

                if (!event.defaultPrevented) {
                    openCookiePreferences();
                }
            }}
            {...props}
        >
            {t('cookie_consent.cookie_preferences')}
        </button>
    );
}
