// Leonida Ledger — the program that hands the guide in (Node 22, standard
// library only). It copies this repository's app/ folder and screenshots/
// folder into the output directory and writes dossier.json there, using the
// kit's buildDossier from vendor/makefun-frontend.ts. The grader runs it in
// a sandbox where /output is the destination; outside the grader,
// MAKEFUN_OUTPUT_DIR stands in for /output, for example:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(source, target) {
  if (!existsSync(source)) return;
  mkdirSync(target, { recursive: true });
  cpSync(source, target, { recursive: true });
}

mkdirSync(outDir, { recursive: true });
copyTree(join(repoRoot, 'app'), join(outDir, 'app'));
copyTree(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'));

// The scorer's own caps for this competition: at most 4 screenshots, each
// at most 256 KiB; app/ at most 993 files and directories and 48 MiB; the
// dossier text at most 160 KiB. buildDossier refuses anything past them.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log('wrote ' + join(outDir, 'dossier.json'));
