import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-amber-500 text-white shadow-sm shadow-emerald-900/20">
                <AppLogoIcon className="size-5 fill-current" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Teach4Free
                </span>
            </div>
        </>
    );
}
