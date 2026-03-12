#!/usr/bin/env node
// Folosire: node scripts/hash-password.mjs PAROLA_TA
import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.error('Utilizare: node scripts/hash-password.mjs PAROLA_TA');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);
console.log('\nHash bcrypt pentru .env.local:\n');
console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
