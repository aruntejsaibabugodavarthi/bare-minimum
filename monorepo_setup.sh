#!/bin/bash
set -e

mkdir -p apps/api
mkdir -p apps/old-web

# Move backend code
mv src apps/api/
mv prisma apps/api/
mv tests apps/api/
mv seed.js apps/api/

# API package.json
cat << 'INNEREOF' > apps/api/package.json
{
  "name": "bare-minimum-api",
  "version": "1.0.0",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "start:prod": "NODE_ENV=production node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest",
    "seed": "node seed.js",
    "lint": "eslint 'src/**/*.js'",
    "format": "prettier --write 'src/**/*.js'"
  },
  "dependencies": {
    "@prisma/client": "5.22.0",
    "bcrypt": "^6.0.0",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "express-rate-limit": "^8.5.2",
    "helmet": "^8.2.0",
    "jsonwebtoken": "^9.0.3",
    "multer": "^2.2.0",
    "nodemailer": "^9.0.3",
    "razorpay": "^2.9.6",
    "winston": "^3.19.0",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "eslint": "^8.57.1",
    "eslint-config-prettier": "^10.1.8",
    "jest": "^30.4.2",
    "prettier": "^3.9.4",
    "prisma": "5.22.0",
    "supertest": "^7.2.2"
  }
}
INNEREOF

# Move frontend code
mv *.html apps/old-web/ || true
mv public apps/old-web/ || true
mv assets apps/old-web/ || true
mv css apps/old-web/ || true
mv js apps/old-web/ || true
mv vite.config.mjs apps/old-web/ || true

# Old web package.json
cat << 'INNEREOF' > apps/old-web/package.json
{
  "name": "bare-minimum-old-web",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build && cp public/sw.js dist/"
  },
  "devDependencies": {
    "vite": "8.1.3"
  }
}
INNEREOF

# Root package.json for workspaces
cat << 'INNEREOF' > package.json
{
  "name": "bare-minimum-monorepo",
  "private": true,
  "workspaces": [
    "apps/*"
  ],
  "scripts": {
    "dev": "npm run dev --workspaces --if-present",
    "build": "npm run build --workspaces --if-present",
    "install:all": "npm install"
  }
}
INNEREOF

# Move environment files and misc
mv .env apps/api/ || true
mv .env.example apps/api/ || true
mv dev.db apps/api/ || true
mv Dockerfile apps/api/ || true
mv docker-compose.yml apps/api/ || true

# remove root node_modules to cleanly reinstall workspace links
rm -rf node_modules
npm install

