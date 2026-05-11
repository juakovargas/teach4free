import { usePage } from '@inertiajs/react';

type Replacements = Record<string, string | number>;

function valueAtPath(source: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce<unknown>((current, segment) => {
        if (current && typeof current === 'object' && segment in current) {
            return (current as Record<string, unknown>)[segment];
        }

        return undefined;
    }, source);
}

export function useTranslation() {
    const { translations = {}, locale = 'en', locales = [] } = usePage().props;

    const t = (key: string, replacements: Replacements = {}): string => {
        const value = valueAtPath(translations as Record<string, unknown>, key);
        let text = typeof value === 'string' ? value : key;

        Object.entries(replacements).forEach(([name, replacement]) => {
            text = text.replaceAll(`:${name}`, String(replacement));
        });

        return text;
    };

    return { t, locale, locales };
}
