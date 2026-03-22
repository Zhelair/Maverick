const SUPPORTED_HOSTS = [
  'youtube.com',
  'youtu.be',
  'music.youtube.com',
  'soundcloud.com',
  'tiktok.com',
  'instagram.com',
  'twitter.com',
  'x.com',
  'reddit.com',
  'vimeo.com',
  'facebook.com',
  'twitch.tv',
  'bandcamp.com',
  'mixcloud.com',
  'dailymotion.com',
  'vk.com',
];

export function validateURL(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  // Sanitize: reject shell-injection attempts
  if (/[;&|`$(){}[\]\\]/.test(url)) {
    return { valid: false, error: 'Invalid URL format' };
  }

  try {
    const parsed = new URL(url);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'Only HTTP/HTTPS URLs are supported' };
    }

    const hostname = parsed.hostname.replace(/^www\./, '');
    const supported = SUPPORTED_HOSTS.some(host => hostname === host || hostname.endsWith(`.${host}`));

    if (!supported) {
      return {
        valid: false,
        error: `Unsupported platform. Supported: ${SUPPORTED_HOSTS.join(', ')}`
      };
    }

    return { valid: true, hostname };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}
