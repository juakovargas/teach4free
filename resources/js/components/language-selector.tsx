import { router } from '@inertiajs/react';
import { Languages } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

type Props = {
    showIcon?: boolean;
    triggerClassName?: string;
} & HTMLAttributes<HTMLDivElement>;

export function LanguageSelector({
    className,
    showIcon = true,
    triggerClassName,
    ...props
}: Props) {
    const { t, locale, locales } = useTranslation();

    return (
        <div className={cn('flex items-center gap-2', className)} {...props}>
            {showIcon && (
                <Languages className="hidden size-4 text-muted-foreground sm:block" />
            )}
            <Select
                value={locale}
                onValueChange={(selectedLocale) =>
                    router.post(
                        '/locale',
                        { locale: selectedLocale },
                        {
                            preserveScroll: true,
                        },
                    )
                }
            >
                <SelectTrigger
                    size="sm"
                    className={cn(
                        'min-w-[4.75rem] sm:min-w-32',
                        triggerClassName,
                    )}
                    aria-label={t('navigation.language')}
                    data-testid="language-selector"
                >
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {locales.map((availableLocale) => (
                        <SelectItem
                            key={availableLocale.code}
                            value={availableLocale.code}
                        >
                            <span className="font-medium uppercase">
                                {availableLocale.code}
                            </span>
                            <span className="hidden sm:inline">
                                {availableLocale.name}
                            </span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
