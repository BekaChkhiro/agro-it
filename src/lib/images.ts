const WEBP_MIME = "image/webp";

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Unable to read file as data URL"));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load image"));
    image.src = src;
  });
}

function convertCanvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to convert canvas to WebP"));
        }
      },
      WEBP_MIME,
      quality,
    );
  });
}

export interface WebPConvertOptions {
  quality?: number;
}

export async function convertImageFileToWebP(
  file: File,
  options: WebPConvertOptions = {},
): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  if (file.type === WEBP_MIME) {
    return file;
  }

  const quality = options.quality ?? 0.9;

  const dataUrl = await readFileAsDataURL(file);
  const imageElement = await loadImage(dataUrl);

  const canvas = document.createElement("canvas");
  canvas.width = imageElement.naturalWidth || imageElement.width;
  canvas.height = imageElement.naturalHeight || imageElement.height;

  const context = canvas.getContext("2d");
  if (!context) {
    return file;
  }

  context.drawImage(imageElement, 0, 0);

  try {
    const blob = await convertCanvasToBlob(canvas, quality);
    const newFileName = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], newFileName, { type: WEBP_MIME });
  } catch (error) {
    console.warn("Failed to convert image to WebP", error);
    return file;
  }
}

