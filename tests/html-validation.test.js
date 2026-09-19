#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS  ${name}`);
    passed++;
  } catch (err) {
    console.log(`  FAIL  ${name}`);
    console.log(`        ${err.message}`);
    failed++;
  }
}

// ── index.html ──────────────────────────────────────────────────────────────

test('index.html exists and is non-empty', () => {
  const filePath = path.join(ROOT, 'index.html');
  assert.ok(fs.existsSync(filePath), 'index.html does not exist');
  const stat = fs.statSync(filePath);
  assert.ok(stat.size > 0, 'index.html is empty');
});

test('index.html contains a <title> tag', () => {
  const content = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert.ok(/<title[\s>]/i.test(content), 'No <title> tag found in index.html');
});

test('index.html contains a meta description', () => {
  const content = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert.ok(
    /meta\s[^>]*name=["']description["']/i.test(content),
    'No meta description found in index.html'
  );
});

test('index.html contains a canonical link', () => {
  const content = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert.ok(
    /link\s[^>]*rel=["']canonical["']/i.test(content),
    'No canonical link found in index.html'
  );
});

test('index.html contains og:title meta property', () => {
  const content = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert.ok(
    /meta\s[^>]*property=["']og:title["']/i.test(content),
    'No og:title meta property found in index.html'
  );
});

// ── work/artemis/index.html ──────────────────────────────────────────────────

test('work/artemis/index.html exists and is non-empty', () => {
  const filePath = path.join(ROOT, 'work', 'artemis', 'index.html');
  assert.ok(fs.existsSync(filePath), 'work/artemis/index.html does not exist');
  const stat = fs.statSync(filePath);
  assert.ok(stat.size > 0, 'work/artemis/index.html is empty');
});

// ── robots.txt ──────────────────────────────────────────────────────────────

test('robots.txt exists', () => {
  const filePath = path.join(ROOT, 'robots.txt');
  assert.ok(fs.existsSync(filePath), 'robots.txt does not exist');
});

// ── sitemap.xml ─────────────────────────────────────────────────────────────

test('sitemap.xml exists', () => {
  const filePath = path.join(ROOT, 'sitemap.xml');
  assert.ok(fs.existsSync(filePath), 'sitemap.xml does not exist');
});

// ── vercel.json ─────────────────────────────────────────────────────────────

test('vercel.json exists and is valid JSON', () => {
  const filePath = path.join(ROOT, 'vercel.json');
  assert.ok(fs.existsSync(filePath), 'vercel.json does not exist');
  const content = fs.readFileSync(filePath, 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    throw new assert.AssertionError({ message: `vercel.json is not valid JSON: ${e.message}` });
  }
  assert.ok(parsed !== null && typeof parsed === 'object', 'vercel.json does not parse to an object');
});

// ── Summary ──────────────────────────────────────────────────────────────────

console.log('');
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}
