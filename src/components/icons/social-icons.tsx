import type { ReactElement, SVGProps } from "react";
import type { SocialPlatform } from "@/lib/site-content";

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M14 8.5V6.75c0-.76.5-1.25 1.28-1.25H17V2.25h-2.5C11.9 2.25 10.5 4 10.5 6.4v2.1H7.5v3.25h3V21H14v-9.25h2.5l.5-3.25H14Z" />
    </svg>
  );
}

export function TiktokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.6 3c.35 2.15 1.62 3.5 3.9 3.66v2.9c-1.42.14-2.68-.32-3.94-1.14v6.12c0 4.06-3.06 6.46-6.4 5.62-2.34-.6-3.9-2.63-3.9-5.14 0-3.5 2.92-5.94 6.42-5.5v3.05c-.36-.1-.73-.16-1.1-.16-1.42 0-2.4.96-2.4 2.4 0 1.42 1.02 2.46 2.42 2.46 1.5 0 2.44-1.04 2.44-2.52V3h2.56Z" />
    </svg>
  );
}

export const socialIcons: Record<SocialPlatform, (props: SVGProps<SVGSVGElement>) => ReactElement> = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  tiktok: TiktokIcon,
};
