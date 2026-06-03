import { useEffect, useRef } from "react";
import type { ImageSettings } from "../../types/editor";
import { drawEditedImage, loadImageFromUrl } from "../../utils/ImageProcessing";
import "./ImagePreview.css";

type ImagePreviewProps = {
    title: string;
    imageUrl: string | null;
    settings: ImageSettings;
    variant: "original" | "edited";
};

export function ImagePreview({
    title,
    imageUrl,
    settings,
    variant,
}: ImagePreviewProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!imageUrl || variant !== "edited" || !canvasRef.current) return;

        let isMounted = true;

        loadImageFromUrl(imageUrl).then((image) => {
            if (!isMounted || !canvasRef.current) return;

            drawEditedImage(image, canvasRef.current, settings);
        });

        return () => {
            isMounted = false;
        };
    }, [imageUrl, settings, variant]);

    return (
        <article className="image-preview">
            <h2>{title}</h2>

            <div className="image-box">
                {!imageUrl && <div className="empty-state">Brak wybranego zdjęcia</div>}

                {imageUrl && variant === "original" && (
                    <img src={imageUrl} alt={title} className="preview-image" />
                )}

                {imageUrl && variant === "edited" && (
                    <canvas
                        ref={canvasRef}
                        className="preview-canvas"
                        aria-label={title}
                    />
                )}
            </div>
        </article>
    );
}