#!/usr/bin/env node
/**
 * Convertit la sortie JSON de Bruno CLI (--reporter-json) en résultats Allure
 * (dossier allure-results/, un fichier .json par test).
 *
 * Usage :
 *   bru run --env production --reporter-json bruno-output.json
 *   node bruno-to-allure.js bruno-output.json allure-results
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const inputFile = process.argv[2] || 'bruno-output.json';
const outputDir = process.argv[3] || 'allure-results';

if (!fs.existsSync(inputFile)) {
  console.error(`Fichier introuvable : ${inputFile}`);
  process.exit(1);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const raw = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

// Le JSON de Bruno est un tableau d'itérations, chacune avec un tableau "results"
const iterations = Array.isArray(raw) ? raw : [raw];

function uuid() {
  return crypto.randomUUID();
}

function mapStatus(status) {
  return status === 'pass' ? 'passed' : 'failed';
}

let convertedCount = 0;

for (const iteration of iterations) {
  const results = iteration.results || [];

  for (const result of results) {
    const testName = result.name || path.basename(result?.test?.filename || 'unnamed-test');

    const preTests = result.preRequestTestResults || [];
    const postTests = result.postResponseTestResults || [];
    const allChecks = [...preTests, ...postTests];

    const durationMs = Math.round((result.runDuration || 0) * 1000) || (result.response?.duration ?? 0);
    const stopTime = Date.now();
    const startTime = stopTime - durationMs;

    const steps = allChecks.map((check) => ({
      name: check.description || 'assertion',
      status: mapStatus(check.status),
      stage: 'finished',
      start: startTime,
      stop: stopTime,
      ...(check.status !== 'pass' && {
        statusDetails: { message: check.error || 'Échec de l\'assertion' },
      }),
    }));

    const allureResult = {
      uuid: uuid(),
      historyId: testName,
      name: testName,
      fullName: result.path || testName,
      status: mapStatus(result.status),
      stage: 'finished',
      start: startTime,
      stop: stopTime,
      statusDetails: result.error ? { message: result.error } : undefined,
      labels: [
        { name: 'suite', value: 'Bruno - test collection' },
        { name: 'framework', value: 'bruno' },
      ],
      parameters: [
        { name: 'method', value: result.request?.method || '' },
        { name: 'url', value: result.request?.url || '' },
        { name: 'status HTTP', value: String(result.response?.status || '') },
      ],
      steps,
    };

    const filePath = path.join(outputDir, `${allureResult.uuid}-result.json`);
    fs.writeFileSync(filePath, JSON.stringify(allureResult, null, 2));
    convertedCount++;
  }
}

console.log(`${convertedCount} test(s) converti(s) vers ${outputDir}/`);
console.log('Génère ensuite le rapport avec :');
console.log(`  allure generate ${outputDir} --clean -o allure-report`);
console.log('  allure open allure-report');
