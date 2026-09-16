import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

const destination = resolve('designer-export');
await mkdir(destination, { recursive: true });
const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.gif': 'image/gif', '.json': 'application/json', '.woff2': 'font/woff2' };
async function files(dir, prefix = '') {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const name = prefix + entry.name;
    if (entry.isDirectory()) result.push(...await files(resolve(dir, entry.name), name + '/'));
    else result.push(name);
  }
  return result;
}
for (const [root, title] of [[resolve('.'), '千金后台'], [resolve('../qjdyfsc'), '千金商城']]) {
  const result = await build({ root, configFile: false, plugins: [react()], base: './', build: { write: false, assetsInlineLimit: 100000000, cssCodeSplit: false, rollupOptions: { output: { format: 'iife', inlineDynamicImports: true } } } });
  const output = result.output;
  let js = output.filter(x => x.type === 'chunk').map(x => x.code).join('\n');
  let css = output.filter(x => x.fileName.endsWith('.css')).map(x => x.source).join('\n');
  const assets = {};
  for (const name of await files(resolve(root, 'public'))) {
    const type = mime[extname(name)];
    if (!type) continue;
    assets['/' + name] = `data:${type};base64,${(await readFile(resolve(root, 'public', name))).toString('base64')}`;
  }
  // Resolve static asset literals without duplicating embedded image bytes.
  js = js.replace(/(["'])(\/?assets\/[^"'\s]+|\/?data\/[^"'\s]+)\1/g, (match, quote, path) => assets['/' + path.replace(/^\//, '')] ? `window.__designerAssets[${JSON.stringify('/' + path.replace(/^\//, ''))}]` : match);
  css = css.replace(/url\((['"]?)(\/assets\/[^)'"\s]+)\1\)/g, (match, quote, path) => assets[path] ? `url("${assets[path]}")` : match);
  const bootstrap = `window.__designerAssets=${JSON.stringify(assets)};
    const resolveAsset=value=>typeof value==='string'?(window.__designerAssets['/'+value.replace(/^\\.?\\//,'')]||value):value;
    const originalAttribute=Element.prototype.setAttribute;
    Element.prototype.setAttribute=function(name,value){return originalAttribute.call(this,name,(name==='src'||name==='href')?resolveAsset(value):value)};
    const imageSrc=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
    Object.defineProperty(HTMLImageElement.prototype,'src',{...imageSrc,set(value){imageSrc.set.call(this,resolveAsset(value))}});
    const originalFetch=window.fetch.bind(window);
    window.fetch=(input,init)=>originalFetch(resolveAsset(input),init);
  `;
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · 交互原型</title><style>${css}</style></head><body><div id="root"></div><script>${(bootstrap + '\n' + js).replace(/<\/script/gi, '<\\/script')}</script></body></html>`;
  await writeFile(resolve(destination, `${title}-交互原型.html`), html);
  console.log(`${title}: ${(Buffer.byteLength(html) / 1048576).toFixed(1)} MB`);
}
