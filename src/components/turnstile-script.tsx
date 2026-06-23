import Script from "next/script";

export function TurnstileScript() {
  return <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />;
}
