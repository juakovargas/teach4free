import {
    BadgeCheck,
    BookOpen,
    Clock,
    Code2,
    GraduationCap,
    HeartHandshake,
    Languages,
    ShieldCheck,
    Sparkles,
    Star,
    Trophy,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

export type PublicBadge = {
    id: number;
    key: string | null;
    name: string | null;
    description: string | null;
    icon: string | null;
    color: string | null;
    category: string | null;
    awarded_at: string | null;
    awarded_reason?: string | null;
    is_visible?: boolean;
    is_featured?: boolean;
    revoked_at?: string | null;
};

const icons: Record<string, LucideIcon> = {
    BadgeCheck,
    BookOpen,
    Clock,
    Code2,
    GraduationCap,
    HeartHandshake,
    Languages,
    ShieldCheck,
    Sparkles,
    Star,
    Trophy,
    Users,
};

function translatedValue(
    t: (key: string) => string,
    key: string | null,
    path: string,
    fallback: string | null,
    defaultText: string,
): string {
    if (!key) {
        return fallback ?? defaultText;
    }

    const translationKey = `badges.definitions.${key}.${path}`;
    const translated = t(translationKey);

    return translated === translationKey ? fallback ?? defaultText : translated;
}

export function useBadgeText() {
    const { t } = useTranslation();

    return {
        name: (badge: PublicBadge) =>
            translatedValue(t, badge.key, 'name', badge.name, t('badges.unknown_badge')),
        description: (badge: PublicBadge) =>
            translatedValue(t, badge.key, 'description', badge.description, ''),
        reason: (badge: PublicBadge) => {
            if (!badge.awarded_reason) {
                return '';
            }

            const translated = t(badge.awarded_reason);

            return translated === badge.awarded_reason ? badge.awarded_reason : translated;
        },
    };
}

export function BadgeIcon({
    icon,
    color,
    className,
}: {
    icon: string | null;
    color: string | null;
    className?: string;
}) {
    const Icon = icon ? icons[icon] ?? BadgeCheck : BadgeCheck;

    return <Icon className={cn('size-4', className)} style={{ color: color ?? undefined }} />;
}

export function EarnedBadgePill({ badge }: { badge: PublicBadge }) {
    const text = useBadgeText();

    return (
        <Badge variant="outline" className="gap-1.5 rounded-full">
            <BadgeIcon icon={badge.icon} color={badge.color} />
            {text.name(badge)}
        </Badge>
    );
}

export function EarnedBadgeCard({ badge }: { badge: PublicBadge }) {
    const { t } = useTranslation();
    const text = useBadgeText();
    const description = text.description(badge);

    return (
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-950">
                    <BadgeIcon icon={badge.icon} color={badge.color} className="size-5" />
                </span>
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{text.name(badge)}</h3>
                        {badge.is_featured && (
                            <Badge className="rounded-full" variant="secondary">
                                {t('badges.featured')}
                            </Badge>
                        )}
                    </div>
                    {description && (
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
                    )}
                    {badge.awarded_at && (
                        <p className="mt-2 text-xs text-muted-foreground">
                            {t('badges.awarded_on', {
                                date: new Date(badge.awarded_at).toLocaleDateString(),
                            })}
                        </p>
                    )}
                </div>
            </div>
        </article>
    );
}
