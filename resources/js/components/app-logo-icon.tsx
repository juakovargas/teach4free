import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 4.5a4 4 0 0 1 4 4c0 .6-.1 1.1-.3 1.6l5.2 4.1a4 4 0 1 1-1.9 2.5l-5.2-4.1a4 4 0 0 1-3.6 0L13 16.7a4 4 0 1 1-1.9-2.5l5.2-4.1a4 4 0 0 1-.3-1.6 4 4 0 0 1 4-4Z" />
            <path d="M12.1 24.1a4 4 0 0 1 2.4 1.2l4.1-2.4a4 4 0 0 1 2.8 0l4.1 2.4a4 4 0 1 1-1.6 2.8l-4.1-2.4-4.1 2.4a4 4 0 1 1-3.6-4Z" />
        </svg>
    );
}
