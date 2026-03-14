import argon2 from 'argon2'

export async function hashPasswordArgon(plain: string): Promise<string> {
  return argon2.hash(plain, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64MB
    timeCost: 3,
    parallelism: 4
  })
}

export async function verifyPasswordArgon(hash: string, plain: string): Promise<boolean> {
  return argon2.verify(hash, plain)
}
