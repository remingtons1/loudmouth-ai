import { createSign } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import { homedir } from 'os'
import path from 'path'

interface ServiceAccountCredentials {
  client_email: string
  private_key: string
}

let credentialsCache: ServiceAccountCredentials | null = null

export function getCredentials(): ServiceAccountCredentials {
  if (credentialsCache) return credentialsCache

  // Option 1: Full credentials JSON as base64 (most reliable)
  if (process.env.GOOGLE_CREDENTIALS_BASE64) {
    const json = Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf8')
    credentialsCache = JSON.parse(json)
    return credentialsCache!
  }

  // Option 2: Individual env vars
  if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    let privateKey = process.env.GOOGLE_PRIVATE_KEY
    // Handle both escaped newlines and actual newlines
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n')
    }
    credentialsCache = {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: privateKey
    }
    return credentialsCache
  }

  // Option 3: Fall back to file-based credentials (for local development)
  const credPath = path.join(homedir(), '.config', 'ga4', 'credentials.json')
  if (existsSync(credPath)) {
    credentialsCache = JSON.parse(readFileSync(credPath, 'utf8'))
    return credentialsCache!
  }

  throw new Error('No Google credentials found. Set GOOGLE_CREDENTIALS_BASE64 or GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY environment variables.')
}

export async function getAccessToken(scope: string): Promise<string> {
  const creds = getCredentials()

  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const now = Math.floor(Date.now() / 1000)
  const payload = Buffer.from(JSON.stringify({
    iss: creds.client_email,
    scope,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  })).toString('base64url')

  const sign = createSign('RSA-SHA256')
  sign.update(header + '.' + payload)
  const signature = sign.sign(creds.private_key, 'base64url')
  const jwt = header + '.' + payload + '.' + signature

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + jwt
  })

  const data = await res.json()
  if (data.error) {
    throw new Error(`Token error: ${data.error} - ${data.error_description}`)
  }

  return data.access_token
}
