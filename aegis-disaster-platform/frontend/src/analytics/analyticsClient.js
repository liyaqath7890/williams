export function trackEvent(eventName, metadata = {}) {
  console.info('[analytics]', eventName, metadata);
}
