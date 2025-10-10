import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join, fileURLToPath } from 'node:path';
import { pipeline } from 'node:stream/promises';
import archiver from 'archiver';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = join(__dirname, '..');
const rokuDir = join(projectRoot, 'apps', 'roku');
const distDir = join(projectRoot, 'dist');

async function zipDirectory(sourceDir, outPath) {
  await mkdir(distDir, { recursive: true });
  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = createWriteStream(outPath);
  archive.directory(sourceDir, false);
  archive.finalize();
  await pipeline(archive, stream);
}

const outputPath = join(distDir, 'omnitv-roku.zip');
await zipDirectory(rokuDir, outputPath);
console.log(`Roku zip criado em ${outputPath}`);
