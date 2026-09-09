import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), '..', 'backend', 'src', 'main', 'resources');
const buildDir = join(root, 'static-build');
const targetDir = join(root, 'static');
const browserDir = join(buildDir, 'browser');

const source = existsSync(browserDir) ? browserDir : buildDir;

rmSync(targetDir, { recursive: true, force: true });
mkdirSync(targetDir, { recursive: true });
cpSync(source, targetDir, { recursive: true });
rmSync(buildDir, { recursive: true, force: true });

console.log(`Angular build copied to ${targetDir}`);
