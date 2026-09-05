/**
 * Sanity.io Management Utility Script
 * 
 * Usage:
 *   node scripts/sanity-manage.js info
 *   node scripts/sanity-manage.js cors
 *   node scripts/sanity-manage.js query "*[_type == 'project']"
 */

const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      process.env[key] = val;
    }
  });
}

const PROJECT_ID = process.env.SANITY_PROJECT_ID || '0bb2mgpi';
const DATASET = process.env.SANITY_DATASET || 'production';
const API_VERSION = process.env.SANITY_API_VERSION || '2023-05-03';
const TOKEN = process.env.SANITY_API_TOKEN;

async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/${endpoint}`;

  const headers = {
    ...options.headers,
  };
  if (TOKEN) {
    headers['Authorization'] = `Bearer ${TOKEN}`;
  }

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error [${res.status}]: ${text}`);
  }
  return res.json();
}

async function getProjectInfo() {
  const project = await apiRequest(`https://api.sanity.io/v${API_VERSION}/projects/${PROJECT_ID}`);
  console.log('--- Sanity Project Info ---');
  console.log(`ID:          ${project.id}`);
  console.log(`Name:        ${project.displayName}`);
  console.log(`Plan:        ${project.plan}`);
  console.log(`Created:     ${project.createdAt}`);

  const counts = await apiRequest(`data/query/${DATASET}?query=${encodeURIComponent('{ "total": count(*), "types": array::unique(*._type) }')}`);
  console.log(`Total Docs:  ${counts.result.total}`);
  console.log(`Doc Types:   ${counts.result.types.join(', ')}`);
}

async function getCorsOrigins() {
  const cors = await apiRequest(`https://api.sanity.io/v${API_VERSION}/projects/${PROJECT_ID}/cors`);
  console.log('--- Authorized CORS Origins ---');
  cors.forEach(c => {
    console.log(`- ${c.origin} (Credentials: ${c.allowCredentials})`);
  });
}

async function runQuery(groq) {
  console.log(`--- Query: ${groq} ---`);
  const data = await apiRequest(`data/query/${DATASET}?query=${encodeURIComponent(groq)}`);
  console.log(JSON.stringify(data.result, null, 2));
}

async function main() {
  const command = process.argv[2] || 'info';
  const arg = process.argv[3];

  try {
    if (command === 'info') {
      await getProjectInfo();
    } else if (command === 'cors') {
      await getCorsOrigins();
    } else if (command === 'query') {
      if (!arg) {
        console.error('Please specify a GROQ query. Example: node scripts/sanity-manage.js query "*[_type == \\"project\\"]"');
        process.exit(1);
      }
      await runQuery(arg);
    } else {
      console.log('Unknown command. Available: info, cors, query');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
