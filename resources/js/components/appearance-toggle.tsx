import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';
import { useTranslation } from '@/hooks/use-translation';

export function AppearanceToggle() {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const { t } = useTranslation();
    const isDark = resolvedAppearance === 'dark';
    const Icon = isDark ? Sun : Moon;
    const label = isDark
        ? t('appearance.switch_to_light')
        : t('appearance.switch_to_dark');

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            aria-label={label}
            title={label}
            data-testid="appearance-toggle"
            onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
        >
            <Icon className="size-5" />
        </Button>
    );
}
