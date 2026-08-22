import { readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

const exportDirectory = resolve("html-export");
const outputPath = resolve("WorkBuddy在线分享.html");
const assetDirectory = resolve(exportDirectory, "assets");

const assetMimeTypes = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

const files = await readFile(resolve(exportDirectory, "index.html"), "utf8");
const scriptMatch = files.match(/src="\.\/(assets\/[^\"]+\.js)"/);
const styleMatch = files.match(/href="\.\/(assets\/[^\"]+\.css)"/);

if (!scriptMatch || !styleMatch) {
  throw new Error("未找到构建后的脚本或样式文件。");
}

let script = await readFile(resolve(exportDirectory, scriptMatch[1]), "utf8");
let style = await readFile(resolve(exportDirectory, styleMatch[1]), "utf8");
const assetPaths = [...new Set([...script, ...style].join("").match(/\/assets\/[\w.-]+/g) ?? [])];
const embeddedAssets = {};

for (const assetPath of assetPaths) {
  const filename = basename(assetPath);
  const extension = filename.slice(filename.lastIndexOf("."));
  const mimeType = assetMimeTypes[extension];

  if (!mimeType) {
    throw new Error(`不支持内嵌的资源类型：${filename}`);
  }

  const encoded = (await readFile(resolve(assetDirectory, filename))).toString("base64");
  const dataUrl = `data:${mimeType};base64,${encoded}`;
  embeddedAssets[assetPath] = dataUrl;
  script = script.replaceAll(JSON.stringify(assetPath), `window.__WORKBUDDY_ASSETS[${JSON.stringify(assetPath)}]`);
  style = style.replaceAll(assetPath, dataUrl);
}

script = `window.__WORKBUDDY_ASSETS = Object.freeze(${JSON.stringify(embeddedAssets)});\n${script}`;
new Function(script);

const standaloneHtml = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>千金大药房管理后台原型</title>
    <style>${style}</style>
  </head>
  <body>
    <div id="root"></div>
    <script>${script.replaceAll("</script", "<\\/script")}</script>
  </body>
</html>
`;

await writeFile(outputPath, standaloneHtml, "utf8");
console.log(`已生成 WorkBuddy 单文件：${outputPath}`);
