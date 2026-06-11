// Simple remote config fetcher for license/payment enforcement
export const DEFAULT_REMOTE_CONFIG = {
  paid: true,
  locked: false,
  message: '',
  maintenance: false,
  ownerContact: '',
  version: null
};

export async function fetchRemoteConfig(url, timeout = 5000) {
  if (!url) return DEFAULT_REMOTE_CONFIG;
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    clearTimeout(id);
    if (!res.ok) return DEFAULT_REMOTE_CONFIG;
    const json = await res.json();
    return { ...DEFAULT_REMOTE_CONFIG, ...json };
  } catch (e) {
    return DEFAULT_REMOTE_CONFIG;
  }
}
