import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import {
    COOKIE_CONSENT_CHANGED_EVENT,
    hasCookieCategoryConsent,
    readCookieConsent,
} from '@/lib/cookie-consent';
import type { CookieConsentRecord, CookieConsentSharedProps } from '@/lib/cookie-consent';

type PageProps = {
    cookieConsent?: CookieConsentSharedProps;
};

export function ConsentAwareTrackingScripts() {
    const { cookieConsent } = usePage().props as PageProps;
    const [consent, setConsent] = useState<CookieConsentRecord | null>(() => {
        return cookieConsent ? readCookieConsent(cookieConsent.settings) : null;
    });

    useEffect(() => {
        if (!cookieConsent) {
            return;
        }

        const handleConsentChanged = (event: Event) => {
            setConsent((event as CustomEvent<CookieConsentRecord | null>).detail ?? readCookieConsent(cookieConsent.settings));
        };

        window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChanged);

        return () => window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChanged);
    }, [cookieConsent]);

    useEffect(() => {
        if (!cookieConsent?.tracking.tracking_enabled) {
            return;
        }

        const analyticsAllowed = canLoadAnalytics(cookieConsent, consent);
        const marketingAllowed = canLoadMarketing(cookieConsent, consent);

        if (analyticsAllowed) {
            injectAnalytics(cookieConsent);
        }

        if (marketingAllowed) {
            injectMarketing(cookieConsent);
        }
    }, [cookieConsent, consent]);

    return null;
}

function canLoadAnalytics(cookieConsent: CookieConsentSharedProps, consent: CookieConsentRecord | null): boolean {
    const shouldBlock = cookieConsent.settings.block_analytics_until_consent || cookieConsent.tracking.cookie_consent_required;

    return shouldBlock ? hasCookieCategoryConsent(consent, 'analytics') : true;
}

function canLoadMarketing(cookieConsent: CookieConsentSharedProps, consent: CookieConsentRecord | null): boolean {
    return cookieConsent.settings.block_marketing_until_consent ? hasCookieCategoryConsent(consent, 'marketing') : true;
}

function injectAnalytics(cookieConsent: CookieConsentSharedProps): void {
    const tracking = cookieConsent.tracking;

    if (tracking.google_analytics_id) {
        appendExternalScript('teach4free-google-analytics', `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(tracking.google_analytics_id)}`);
        appendInlineScript('teach4free-google-analytics-config', `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${escapeJs(tracking.google_analytics_id)}');
        `);
    }

    if (tracking.google_tag_manager_id) {
        appendInlineScript('teach4free-google-tag-manager', `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${escapeJs(tracking.google_tag_manager_id)}');
        `);
    }

    if (tracking.plausible_domain) {
        const script = appendExternalScript('teach4free-plausible', 'https://plausible.io/js/script.js');
        script?.setAttribute('data-domain', tracking.plausible_domain);
    }

    if (tracking.microsoft_clarity_id) {
        appendInlineScript('teach4free-clarity', `
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${escapeJs(tracking.microsoft_clarity_id)}");
        `);
    }
}

function injectMarketing(cookieConsent: CookieConsentSharedProps): void {
    const tracking = cookieConsent.tracking;

    if (tracking.meta_pixel_id) {
        appendInlineScript('teach4free-meta-pixel', `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${escapeJs(tracking.meta_pixel_id)}');
            fbq('track', 'PageView');
        `);
    }

    if (tracking.tiktok_pixel_id) {
        appendInlineScript('teach4free-tiktok-pixel', `
            !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
                ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
                ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
                for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
                ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
                ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
                ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
                var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;
                var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                ttq.load('${escapeJs(tracking.tiktok_pixel_id)}');ttq.page();
            }(window, document, 'ttq');
        `);
    }

    if (tracking.linkedin_partner_id) {
        appendInlineScript('teach4free-linkedin-insight', `
            _linkedin_partner_id = "${escapeJs(tracking.linkedin_partner_id)}";
            window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
            window._linkedin_data_partner_ids.push(_linkedin_partner_id);
            (function(l) {
                if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}
                var s = document.getElementsByTagName("script")[0];
                var b = document.createElement("script");
                b.type = "text/javascript";b.async = true;
                b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
                s.parentNode.insertBefore(b, s);
            })(window.lintrk);
        `);
    }

    if (tracking.custom_head_script) {
        appendCustomHtml('teach4free-custom-head-script', tracking.custom_head_script, document.head);
    }

    if (tracking.custom_body_script) {
        appendCustomHtml('teach4free-custom-body-script', tracking.custom_body_script, document.body);
    }
}

function appendExternalScript(id: string, src: string): HTMLScriptElement | null {
    if (document.getElementById(id)) {
        return null;
    }

    const script = document.createElement('script');
    script.id = id;
    script.async = true;
    script.src = src;
    document.head.appendChild(script);

    return script;
}

function appendInlineScript(id: string, code: string): void {
    if (document.getElementById(id)) {
        return;
    }

    const script = document.createElement('script');
    script.id = id;
    script.text = code;
    document.head.appendChild(script);
}

function appendCustomHtml(id: string, html: string, target: HTMLElement): void {
    if (document.getElementById(id)) {
        return;
    }

    const container = document.createElement('div');
    container.id = id;
    container.hidden = true;
    const template = document.createElement('template');
    template.innerHTML = html;

    template.content.querySelectorAll('script').forEach((originalScript) => {
        const executableScript = document.createElement('script');

        for (const attribute of originalScript.attributes) {
            executableScript.setAttribute(attribute.name, attribute.value);
        }

        executableScript.text = originalScript.text;
        originalScript.replaceWith(executableScript);
    });

    container.appendChild(template.content);
    target.appendChild(container);
}

function escapeJs(value: string): string {
    return value.replaceAll('\\', '\\\\').replaceAll("'", "\\'");
}
