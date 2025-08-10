#!/usr/bin/env node

// Build script for client-only (Netlify compatible)
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building client for Netlify...');

try {
  // Build the client with Vite
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Create netlify functions dist if it doesn't exist
  const functionsDir = path.join(process.cwd(), 'netlify', 'functions');
  if (fs.existsSync(functionsDir)) {
    console.log('Netlify functions directory found');
  }
  
  console.log('✅ Client build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}