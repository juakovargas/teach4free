import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M7 9.5C7 7.6 8.6 6 10.5 6H33v24H10.5A3.5 3.5 0 0 0 7 33.5v-24Zm3.5 0a1 1 0 0 0-1 1v17.2c.3-.1.6-.2 1-.2H30.5v-18h-20Z"
            />
            <path
                d="M9.5 31.5A1.5 1.5 0 0 1 11 30h22v4H11a1.5 1.5 0 0 1-1.5-1.5v-1Z"
            />
            <path
                d="M15 14h10v3H15v-3Zm0 6h8v3h-8v-3Z"
            />
        </svg>
    );
}
