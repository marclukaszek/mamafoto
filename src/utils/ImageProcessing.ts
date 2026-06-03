import type { ImageSettings } from "../types/editor";

function clamp(value: number, min = 0, max = 255) {
    return Math.min(max, Math.max(min, value));
}

function applyContrast(value: number, contrast: number) {
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    return factor * (value - 128) + 128;
}

function applySaturation(
    r: number,
    g: number,
    b: number,
    saturation: number
) {
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    const amount = saturation / 100;

    return {
        r: gray + (r - gray) * amount,
        g: gray + (g - gray) * amount,
        b: gray + (b - gray) * amount,
    };
}

function applySharpness(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    amount: number
) {
    if (amount <= 0) return;

    const imageData = ctx.getImageData(0, 0, width, height);
    const src = imageData.data;
    const output = new Uint8ClampedArray(src);

    const strength = amount / 100;

    const kernel = [
        0,
        -1 * strength,
        0,
        -1 * strength,
        1 + 4 * strength,
        -1 * strength,
        0,
        -1 * strength,
        0,
    ];

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            for (let channel = 0; channel < 3; channel++) {
                let sum = 0;
                let kernelIndex = 0;

                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const pixelIndex = ((y + ky) * width + (x + kx)) * 4 + channel;
                        sum += src[pixelIndex] * kernel[kernelIndex];
                        kernelIndex++;
                    }
                }

                const currentIndex = (y * width + x) * 4 + channel;
                output[currentIndex] = clamp(sum);
            }
        }
    }

    imageData.data.set(output);
    ctx.putImageData(imageData, 0, 0);
}

export function drawEditedImage(
    image: HTMLImageElement,
    canvas: HTMLCanvasElement,
    settings: ImageSettings
) {
    canvas.width = settings.width;
    canvas.height = settings.height;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, settings.width, settings.height);

    const imageData = ctx.getImageData(0, 0, settings.width, settings.height);
    const data = imageData.data;

    const brightnessFactor = settings.brightness / 100;
    const exposureFactor = Math.pow(2, settings.exposure / 100);
    const contrastValue = settings.contrast - 100;
    const gammaValue = Math.max(0.1, settings.gamma);

    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        r *= brightnessFactor * exposureFactor;
        g *= brightnessFactor * exposureFactor;
        b *= brightnessFactor * exposureFactor;

        luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        if (luminance < 0.5) {
            const shadowPower = (settings.shadows / 100) * (1 - luminance) * 80;
            r += shadowPower;
            g += shadowPower;
            b += shadowPower;
        }

        if (luminance > 0.45) {
            const highlightPower = (settings.highlights / 100) * luminance * 70;
            r += highlightPower;
            g += highlightPower;
            b += highlightPower;
        }

        const blackPower = settings.blacks * (1 - luminance) * 0.8;
        r += blackPower;
        g += blackPower;
        b += blackPower;

        const whitePower = settings.whites * luminance * 0.8;
        r += whitePower;
        g += whitePower;
        b += whitePower;

        r = 255 * Math.pow(clamp(r) / 255, 1 / gammaValue);
        g = 255 * Math.pow(clamp(g) / 255, 1 / gammaValue);
        b = 255 * Math.pow(clamp(b) / 255, 1 / gammaValue);

        r = applyContrast(r, contrastValue);
        g = applyContrast(g, contrastValue);
        b = applyContrast(b, contrastValue);

        const saturated = applySaturation(r, g, b, settings.saturation);
        r = saturated.r;
        g = saturated.g;
        b = saturated.b;

        r += settings.temperature * 0.7;
        b -= settings.temperature * 0.7;

        g += settings.tint * 0.4;
        r += settings.tint * 0.2;
        b += settings.tint * 0.2;

        data[i] = clamp(r);
        data[i + 1] = clamp(g);
        data[i + 2] = clamp(b);
    }

    ctx.putImageData(imageData, 0, 0);

    if (settings.sharpness > 0) {
        applySharpness(ctx, settings.width, settings.height, settings.sharpness);
    }
}

export function loadImageFromUrl(imageUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Nie udało się wczytać zdjęcia."));

        image.src = imageUrl;
    });
}