import { useRef, useState } from "react";
import { ControlsPanel } from "../ControlsPanel/ControlsPanel";
import { ImagePreview } from "../ImagePreview/ImagePreview";
import type { ImageSettings } from "../../types/editor";
import { drawEditedImage, loadImageFromUrl } from "../../utils/ImageProcessing";
import "./ImageEditor.css";
import logo from "../../assets/logo.png";

const defaultSettings: ImageSettings = {
    brightness: 100,
    exposure: 0,
    contrast: 100,
    saturation: 100,

    shadows: 0,
    highlights: 0,
    gamma: 1,
    blacks: 0,
    whites: 0,

    temperature: 0,
    tint: 0,

    sharpness: 0,

    width: 500,
    height: 350,
};

export function ImageEditor() {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [settings, setSettings] = useState<ImageSettings>(defaultSettings);

    const [history, setHistory] = useState<ImageSettings[]>([]);
    const [future, setFuture] = useState<ImageSettings[]>([]);
    const isChangingRef = useRef(false);

    function saveToHistory() {
        setHistory((currentHistory) => [...currentHistory, settings]);
        setFuture([]);
    }

    function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (!file) return;

        const url = URL.createObjectURL(file);
        setImageUrl(url);

        const image = new Image();

        image.onload = () => {
            const newSettings: ImageSettings = {
                ...defaultSettings,
                width: image.naturalWidth,
                height: image.naturalHeight,
            };

            setSettings(newSettings);
            setHistory([]);
            setFuture([]);
        };

        image.src = url;
    }

    function updateSetting<K extends keyof ImageSettings>(
        key: K,
        value: ImageSettings[K]
    ) {
        setSettings((currentSettings) => ({
            ...currentSettings,
            [key]: value,
        }));
    }
    function pushCurrentSettingsToHistory() {
        if (isChangingRef.current) return;

        isChangingRef.current = true;

        setHistory((currentHistory) => {
            const lastHistoryItem = currentHistory[currentHistory.length - 1];

            if (JSON.stringify(lastHistoryItem) === JSON.stringify(settings)) {
                return currentHistory;
            }

            return [...currentHistory, settings];
        });

        setFuture([]);
    }

    function finishChangingSettings() {
        isChangingRef.current = false;
    }

    function resetSettings() {
        saveToHistory();

        setSettings((currentSettings) => ({
            ...defaultSettings,
            width: currentSettings.width,
            height: currentSettings.height,
        }));
    }

    function undo() {
        if (history.length === 0) return;

        const previousSettings = history[history.length - 1];

        setFuture((currentFuture) => [settings, ...currentFuture]);
        setHistory((currentHistory) => currentHistory.slice(0, -1));
        setSettings(previousSettings);
    }

    function redo() {
        if (future.length === 0) return;

        const nextSettings = future[0];

        setHistory((currentHistory) => [...currentHistory, settings]);
        setFuture((currentFuture) => currentFuture.slice(1));
        setSettings(nextSettings);
    }


    async function downloadEditedImage() {
        if (!imageUrl) return;

        const image = await loadImageFromUrl(imageUrl);

        const canvas = document.createElement("canvas");
        drawEditedImage(image, canvas, settings);

        const link = document.createElement("a");
        link.download = "edited-photo.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    }

    return (
        <main className="editor-page">
            <header className="editor-header">
                <div className="editor-header-text">
                    <h1>MamaFoto - edytor zdjęć dla Mamy</h1>
                    <p>Wgraj zdjęcie i zmieniaj ustawienia na żywo.</p>
                </div>

                <img
                    className="editor-logo"
                    src={logo}
                    alt="MamaFoto logo"
                />
            </header>

            <section className="editor-upload">
                <label className="upload-label">
                    Wybierz zdjęcie
                    <input type="file" accept="image/*" onChange={handleImageUpload} />
                </label>

                <button
                    className="history-button"
                    onClick={undo}
                    disabled={history.length === 0}
                >
                    Wstecz
                </button>

                <button
                    className="history-button"
                    onClick={redo}
                    disabled={future.length === 0}
                >
                    Przywróć
                </button>

                {imageUrl && (
                    <>
                        <button className="reset-button" onClick={resetSettings}>
                            Resetuj ustawienia
                        </button>

                        <button className="download-button" onClick={downloadEditedImage}>
                            Pobierz zdjęcie
                        </button>
                    </>
                )}
            </section>

            <section className="editor-layout">
                <div className="preview-area">
                    <ImagePreview
                        title="Przed edycją"
                        imageUrl={imageUrl}
                        settings={settings}
                        variant="original"
                    />

                    <ImagePreview
                        title="W trakcie edycji"
                        imageUrl={imageUrl}
                        settings={settings}
                        variant="edited"
                    />
                </div>

                <ControlsPanel
                    settings={settings}
                    onChange={updateSetting}
                    onChangeStart={pushCurrentSettingsToHistory}
                    onChangeEnd={finishChangingSettings}
                />
            </section>
        </main>
    );
}