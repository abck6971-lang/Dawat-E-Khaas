import { SignJWT, jwtVerify } from 'jose';

const getSecretKey = () => new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || 'fallback_secret_for_dev');

export interface AdminPayload {
  username: string;
  role: 'admin';
}

export async function signAdminToken(username: string): Promise<string> {
  const token = await new SignJWT({ username, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(getSecretKey());
  return token;
}

export async function verifyAdminToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as AdminPayload;
  } catch {
    return null;
  }
}
