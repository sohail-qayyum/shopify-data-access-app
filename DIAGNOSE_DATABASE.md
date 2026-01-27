# Shopify Data Access App - Diagnostic Script

Run this script on your VPS to check the integrity of your database and sessions.

## 1. Create the diagnostic script
```bash
cd ~/shopify-data-app
nano diagnose.js
```

## 2. Paste this code
```javascript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function diagnose() {
  console.log('--- Shopify Data Access App Diagnostic ---');
  
  try {
    const sessions = await prisma.session.findMany({
      include: {
        dataScopes: true,
        apiKeys: true
      }
    });

    console.log(`Found ${sessions.length} sessions.`);

    sessions.forEach(session => {
      console.log(`\nShop: ${session.shop}`);
      console.log(`Session ID: ${session.id}`);
      console.log(`Scopes: ${session.dataScopes.length} records`);
      session.dataScopes.forEach(scope => {
        console.log(`  - ${scope.scopeName}: ${scope.enabled ? 'ENABLED' : 'DISABLED'}`);
      });
      console.log(`API Keys: ${session.apiKeys.length} records`);
    });

    if (sessions.length === 0) {
      console.log('\nWarning: No sessions found in database.');
    }

  } catch (error) {
    console.error('Diagnostic failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
```

## 3. Run the script
```bash
node diagnose.js
```

## 4. Share the output
Copy the output and share it with me. This will tell us exactly what's in your database and if the scopes are correctly linked to your sessions.

---

## 5. Potential Fix: Force Scope Re-initialization
If the diagnostic shows 0 scopes, you can run this "FIX" script:

```bash
nano fix_scopes.js
```

Paste this:
```javascript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fix() {
  const sessions = await prisma.session.findMany();
  for (const session of sessions) {
    console.log(`Fixing scopes for ${session.shop}...`);
    const scopeNames = ['orders', 'customers', 'inventory'];
    for (const scopeName of scopeNames) {
      await prisma.dataScope.upsert({
        where: {
          sessionId_scopeName: {
            sessionId: session.id,
            scopeName: scopeName
          }
        },
        update: {},
        create: {
          sessionId: session.id,
          scopeName: scopeName,
          enabled: false
        }
      });
    }
  }
  console.log('Done!');
  await prisma.$disconnect();
}

fix();
```

Run it:
```bash
node fix_scopes.js
```
