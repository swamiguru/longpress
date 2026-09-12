import fs from 'node:fs';
import path from 'node:path';

export interface ResponsiveImageOptions {
  aspectRatio?: '16/9' | '1/1' | '4/3' | '3/2';
  customSizes?: string;
  customSrcset?: string;
  width?: number;
  height?: number;
}

export interface ResponsiveImageData {
  src: string;
  srcset?: string;
  sizes: string;
  width: number;
  height: number;
  aspectRatioCss: string;
  hasVariants: boolean;
}

const DEFAULT_DIMENSIONS: Record<string, { width: number; height: number; css: string }> = {
  '16/9': { width: 1200, height: 675, css: '16 / 9' },
  '1/1': { width: 800, height: 800, css: '1 / 1' },
  '4/3': { width: 1200, height: 900, css: '4 / 3' },
  '3/2': { width: 1200, height: 800, css: '3 / 2' },
};

/**
 * Resolves an image path into a zero-CLS responsive configuration with automatic
 * srcset generation based on viewport breakpoints (mobile: 480w/320w, tablet: 800w, desktop: 1200w/640w).
 */
export function getResponsiveImage(
  imagePath: string,
  options: ResponsiveImageOptions = {}
): ResponsiveImageData {
  const ratioKey = options.aspectRatio || '16/9';
  const defaults = DEFAULT_DIMENSIONS[ratioKey] || DEFAULT_DIMENSIONS['16/9'];
  const width = options.width || defaults.width;
  const height = options.height || defaults.height;
  const aspectRatioCss = defaults.css;

  // If the author provided an explicit custom srcset, honor it
  if (options.customSrcset) {
    return {
      src: imagePath,
      srcset: options.customSrcset,
      sizes: options.customSizes || (ratioKey === '1/1' ? '(max-width: 640px) 100vw, 320px' : '(max-width: 640px) 100vw, (max-width: 1024px) 760px, 1200px'),
      width,
      height,
      aspectRatioCss,
      hasVariants: true,
    };
  }

  // Check for auto-generated responsive width variants in public directory
  try {
    const cleanPath = imagePath.replace(/^\//, '');
    const ext = path.extname(cleanPath);
    const dir = path.dirname(cleanPath);
    const baseName = path.basename(cleanPath, ext);

    const publicDir = path.join(process.cwd(), 'public', dir);
    
    // Check for 16:9 story variants: 480w, 800w, 1200w
    const v480 = path.join(publicDir, `${baseName}-480w.webp`);
    const v800 = path.join(publicDir, `${baseName}-800w.webp`);
    const v1200 = path.join(publicDir, `${baseName}-1200w.webp`);

    // Check for 1:1 daily brief variants: 320w, 640w
    const v320 = path.join(publicDir, `${baseName}-320w.webp`);
    const v640 = path.join(publicDir, `${baseName}-640w.webp`);

    const variants: { url: string; width: number }[] = [];

    if (fs.existsSync(v480)) variants.push({ url: `/${dir}/${baseName}-480w.webp`, width: 480 });
    if (fs.existsSync(v800)) variants.push({ url: `/${dir}/${baseName}-800w.webp`, width: 800 });
    if (fs.existsSync(v1200)) variants.push({ url: `/${dir}/${baseName}-1200w.webp`, width: 1200 });

    if (fs.existsSync(v320)) variants.push({ url: `/${dir}/${baseName}-320w.webp`, width: 320 });
    if (fs.existsSync(v640)) variants.push({ url: `/${dir}/${baseName}-640w.webp`, width: 640 });

    if (variants.length > 0) {
      // Sort by width ascending
      variants.sort((a, b) => a.width - b.width);
      const srcset = variants.map((v) => `${v.url} ${v.width}w`).join(', ');
      
      const defaultSizes = ratioKey === '1/1'
        ? '(max-width: 640px) 100vw, 320px'
        : '(max-width: 640px) 100vw, (max-width: 1024px) 760px, 1200px';

      const bestFallback = variants[variants.length - 1].url;

      return {
        src: bestFallback,
        srcset,
        sizes: options.customSizes || defaultSizes,
        width,
        height,
        aspectRatioCss,
        hasVariants: true,
      };
    }
  } catch {
    // If running in an environment where filesystem checks fail, fallback gracefully
  }

  // Fallback for single image (e.g. standalone SVG or unoptimized image)
  const defaultSizes = ratioKey === '1/1'
    ? '(max-width: 640px) 100vw, 320px'
    : '(max-width: 640px) 100vw, (max-width: 1024px) 760px, 1200px';

  return {
    src: imagePath,
    sizes: options.customSizes || defaultSizes,
    width,
    height,
    aspectRatioCss,
    hasVariants: false,
  };
}
