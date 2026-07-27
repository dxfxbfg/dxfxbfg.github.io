import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { experimental_getFontFileURL } from "astro:assets";

/**
 * 加载字体文件 buffer 用于 Satori OG 渲染。
 *
 * - build（PROD）：直接读 dist 下的字体文件，绕过 build 期 fetch 本地 dev server
 *   字体文件时与 HTTP 代理冲突导致 "other side closed" 的问题。
 * - dev：fetch dev server（dev server 服务字体文件，不走代理）。
 *
 * fontPath 是 `astro:assets` fontData 里 `src[].url`，形如 `/_astro/fonts/<hash>.ttf`。
 */
export async function loadFontData(
  fontPath: string,
  requestUrl: URL
): Promise<ArrayBuffer> {
  if (import.meta.env.PROD) {
    const buffer = await readFile(resolve(process.cwd(), "dist" + fontPath));
    return buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    );
  }

  const url = experimental_getFontFileURL(fontPath, requestUrl);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch font ${fontPath}: ${res.status}`);
  }
  return res.arrayBuffer();
}
