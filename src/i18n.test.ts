import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const COMPONENTS_DIR = path.join(__dirname, 'components');

const ALLOWED_PATTERNS = [
  /className=/,
  /style=/,
  /href=/,
  /rel=/,
  /target=/,
  /type=/,
  /id=/,
  /htmlFor=/,
  /autoComplete=/,
  /placeholder=\{strings\./,
  /title=\{strings\./,
  /alt=\{strings\./,
  /key=/,
  /data-/,
  /aria-/,
  /console\./,
  /import /,
  /export /,
  /from '/,
  /const /,
  /let /,
  /function /,
  /return /,
  /interface /,
  /type /,
  /useState/,
  /useEffect/,
  /useDenomination/,
  /useAuth/,
  /#[0-9a-fA-F]{6}/,
  /\d+px/,
  /\d+%/,
  /\d+ms/,
  /animationDelay/,
  /toFixed/,
  /toLocaleString/,
  /\.map\(/,
  /\.filter\(/,
  /\.find\(/,
  /\.sort\(/,
  /localStorage/,
  /JSON\./,
  /Math\./,
  /Date\(/,
  /new Date/,
  /Error\(/,
  /throw /,
  /catch /,
  /try /,
  /if \(/,
  /else /,
  /switch /,
  /case /,
  /break/,
  /default:/,
  /null/,
  /undefined/,
  /true/,
  /false/,
  /\?\./,
  /\?\?/,
  /&&/,
  /\|\|/,
  /=>/,
  /async /,
  /await /,
  /Promise/,
];

const TECHNICAL_STRINGS = [
  'monotone',
  'solidValue',
  'dashedValue',
  'label',
  'volumeBtc',
  'swapCount',
  'avgSwapSize',
  'isCurrentMonth',
  'volumeChange',
  'swapChange',
  'avgSize',
  'date',
  'volume',
  'swaps',
  'left',
  'right',
  'asc',
  'desc',
  'content',
  'password',
  'text',
  'submit',
  'off',
];

const HARDCODED_STRING_PATTERN = /[>=]\s*["']([A-Z][a-zA-Z\s]+|[a-z][a-zA-Z\s]{3,})["']/g;

function extractHardcodedStrings(content: string, filename: string): string[] {
  const issues: string[] = [];
  const lines = content.split('\n');

  lines.forEach((line, lineNum) => {
    if (ALLOWED_PATTERNS.some(p => p.test(line))) {
      return;
    }

    const stringMatches = line.match(HARDCODED_STRING_PATTERN);
    if (stringMatches) {
      stringMatches.forEach(match => {
        const extractedString = match.replace(/[>=\s"']/g, '');

        if (TECHNICAL_STRINGS.includes(extractedString)) {
          return;
        }

        if (!match.includes('strings.') &&
            !match.includes('formatValue') &&
            !match.includes('formatSats') &&
            !match.includes('Denomination') &&
            !/^[>=]\s*["'][a-z]+["']$/.test(match)) {
          issues.push(`${filename}:${lineNum + 1}: ${match.trim()}`);
        }
      });
    }
  });

  return issues;
}

describe('i18n enforcement', () => {
  it('should have all UI strings in the i18n file', async () => {
    const { en } = await import('./i18n');

    expect(en.common).toBeDefined();
    expect(en.login).toBeDefined();
    expect(en.dashboard).toBeDefined();
    expect(en.table).toBeDefined();
    expect(en.format).toBeDefined();
  });

  it('should have required common strings', async () => {
    const { en } = await import('./i18n');

    expect(en.common.poweredBy).toBe('Powered by');
    expect(en.common.boltz).toBe('Boltz');
    expect(en.common.signOut).toBe('Sign Out');
    expect(en.common.btc).toBe('BTC');
    expect(en.common.sats).toBe('sats');
  });

  it('should have required login strings', async () => {
    const { en } = await import('./i18n');

    expect(en.login.title).toBe('Partner Dashboard');
    expect(en.login.apiKey).toBe('API Key');
    expect(en.login.apiSecret).toBe('API Secret');
  });

  it('should have required dashboard strings', async () => {
    const { en } = await import('./i18n');

    expect(en.dashboard.totalVolume).toBe('Total Volume');
    expect(en.dashboard.totalSwaps).toBe('Total Number of Swaps');
    expect(en.dashboard.avgSwapSize).toBe('Average Swap Size');
  });

  it('should have required table strings', async () => {
    const { en } = await import('./i18n');

    expect(en.table.monthlyBreakdown).toBe('Monthly Breakdown');
    expect(en.table.month).toBe('Month');
    expect(en.table.volume).toBe('Volume');
    expect(en.table.swaps).toBe('Swaps');
  });

  it('components should import i18n', () => {
    const componentFiles = fs.readdirSync(COMPONENTS_DIR)
      .filter(f => f.endsWith('.tsx') && !f.endsWith('.test.tsx'));

    const missingImports: string[] = [];

    componentFiles.forEach(file => {
      const filePath = path.join(COMPONENTS_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      if (file === 'StatsCard.tsx') {
        return;
      }

      if (!content.includes("from '../i18n'") && !content.includes('from "../i18n"')) {
        missingImports.push(file);
      }
    });

    expect(missingImports).toEqual([]);
  });

  it('components should use strings from i18n (no hardcoded user-facing text)', () => {
    const componentFiles = fs.readdirSync(COMPONENTS_DIR)
      .filter(f => f.endsWith('.tsx') && !f.endsWith('.test.tsx'));

    const allIssues: string[] = [];

    componentFiles.forEach(file => {
      const filePath = path.join(COMPONENTS_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const issues = extractHardcodedStrings(content, file);
      allIssues.push(...issues);
    });

    if (allIssues.length > 0) {
      console.log('Potential hardcoded strings found:');
      allIssues.forEach(issue => console.log(`  ${issue}`));
    }

    expect(allIssues.length).toBe(0);
  });
});
