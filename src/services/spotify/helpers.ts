// helper functions for the PKCE workflow

export function generateRandomString(size: number): string {
  const array = new Uint32Array(size)
  window.crypto.getRandomValues(array)
  return Array.from(array, dec => (`0${dec.toString(16)}`).substr(-2)).join('')
}

export async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return await window.crypto.subtle.digest('SHA-256', data)
}

export function base64urlencode(str: ArrayBuffer): string {
  // Convert the ArrayBuffer to string using Uint8 array to convert to what btoa accepts.
  // btoa accepts chars only within ascii 0-255 and base64 encodes them.
  // Then convert the base64 encoded to base64url encoded
  //   (replace + with -, replace / with _, trim trailing =)
  return btoa(String.fromCharCode.apply(null, new Uint8Array(str) as any))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function pkceChallengeFromVerifier(v: string): Promise<string> {
  const hash = await sha256(v)
  return base64urlencode(hash)
}
