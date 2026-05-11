import { router } from '@inertiajs/react';
import { Languages } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';

export function LanguageSelector() {
    const { t, locale, locales } = useTranslation();

    return (
        <div className="flex items-center gap-2">
            <Languages className="hidden size-4 text-muted-foreground sm:block" />
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
                    className="min-w-28"
                    aria-label={t('navigation.language')}
                >
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {locales.map((availableLocale) => (
                        <SelectItem
                            key={availableLocale.code}
                            value={availableLocale.code}
                        >
                            {availableLocale.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
