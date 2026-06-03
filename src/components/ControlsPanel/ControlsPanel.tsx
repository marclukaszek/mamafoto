import type { ReactNode } from "react";
import type { ImageSettings } from "../../types/editor";
import "./ControlsPanel.css";

type ControlsPanelProps = {
    settings: ImageSettings;
    onChange: <K extends keyof ImageSettings>(
        key: K,
        value: ImageSettings[K]
    ) => void;
    onChangeStart: () => void;
    onChangeEnd: () => void;
};

export function ControlsPanel({
    settings,
    onChange,
    onChangeStart,
    onChangeEnd,
}: ControlsPanelProps) {
    return (
        <aside className="controls-panel">
            <h2>Ustawienia</h2>

            <PanelSection title="Podstawowe">
                <ControlSlider
                    label="Jasność"
                    value={settings.brightness}
                    min={0}
                    max={200}
                    step={1}
                    unit="%"
                    onChangeStart={onChangeStart}
                    onChangeEnd={onChangeEnd}
                    onChange={(value) => onChange("brightness", value)}
                />

                <ControlSlider
                    label="Kontrast"
                    value={settings.contrast}
                    min={0}
                    max={200}
                    step={1}
                    unit="%"
                    onChangeStart={onChangeStart}
                    onChangeEnd={onChangeEnd}
                    onChange={(value) => onChange("contrast", value)}
                />

                <ControlSlider
                    label="Nasycenie"
                    value={settings.saturation}
                    min={0}
                    max={200}
                    step={1}
                    unit="%"
                    onChangeStart={onChangeStart}
                    onChangeEnd={onChangeEnd}
                    onChange={(value) => onChange("saturation", value)}
                />
            </PanelSection>

            <PanelSection title="Światło">
                <ControlSlider
                    label="Ekspozycja"
                    value={settings.exposure}
                    min={-100}
                    max={100}
                    step={1}
                    unit=""
                    onChangeStart={onChangeStart}
                    onChangeEnd={onChangeEnd}
                    onChange={(value) => onChange("exposure", value)}
                />

                <ControlSlider
                    label="Cienie"
                    value={settings.shadows}
                    min={-100}
                    max={100}
                    step={1}
                    unit=""
                    onChangeStart={onChangeStart}
                    onChangeEnd={onChangeEnd}
                    onChange={(value) => onChange("shadows", value)}
                />

                <ControlSlider
                    label="Światła"
                    value={settings.highlights}
                    min={-100}
                    max={100}
                    step={1}
                    unit=""
                    onChangeStart={onChangeStart}
                    onChangeEnd={onChangeEnd}
                    onChange={(value) => onChange("highlights", value)}
                />

                <ControlSlider
                    label="Gamma"
                    value={settings.gamma}
                    min={0.5}
                    max={2.5}
                    step={0.1}
                    unit=""
                    onChangeStart={onChangeStart}
                    onChangeEnd={onChangeEnd}
                    onChange={(value) => onChange("gamma", value)}
                />

                <ControlSlider
                    label="Czernie"
                    value={settings.blacks}
                    min={-100}
                    max={100}
                    step={1}
                    unit=""
                    onChangeStart={onChangeStart}
                    onChangeEnd={onChangeEnd}
                    onChange={(value) => onChange("blacks", value)}
                />

                <ControlSlider
                    label="Biele"
                    value={settings.whites}
                    min={-100}
                    max={100}
                    step={1}
                    unit=""
                    onChangeStart={onChangeStart}
                    onChangeEnd={onChangeEnd}
                    onChange={(value) => onChange("whites", value)}
                />
            </PanelSection>

            <PanelSection title="Kolor">
                <ControlSlider
                    label="Temperatura"
                    value={settings.temperature}
                    min={-100}
                    max={100}
                    step={1}
                    unit=""
                    onChangeStart={onChangeStart}
                    onChangeEnd={onChangeEnd}
                    onChange={(value) => onChange("temperature", value)}
                />

                <ControlSlider
                    label="Odcień"
                    value={settings.tint}
                    min={-100}
                    max={100}
                    step={1}
                    unit=""
                    onChangeStart={onChangeStart}
                    onChangeEnd={onChangeEnd}
                    onChange={(value) => onChange("tint", value)}
                />
            </PanelSection>

            <PanelSection title="Szczegóły">
                <ControlSlider
                    label="Ostrość"
                    value={settings.sharpness}
                    min={0}
                    max={100}
                    step={1}
                    unit=""
                    onChangeStart={onChangeStart}
                    onChangeEnd={onChangeEnd}
                    onChange={(value) => onChange("sharpness", value)}
                />
            </PanelSection>

            <PanelSection title="Rozmiar obrazka">
                <label className="number-control">
                    Szerokość px
                    <input
                        type="number"
                        min={50}
                        max={8000}
                        value={settings.width}
                        onFocus={onChangeStart}
                        onBlur={onChangeEnd}
                        onChange={(event) => onChange("width", Number(event.target.value))}
                    />
                </label>

                <label className="number-control">
                    Wysokość px
                    <input
                        type="number"
                        min={50}
                        max={8000}
                        value={settings.height}
                        onFocus={onChangeStart}
                        onBlur={onChangeEnd}
                        onChange={(event) => onChange("height", Number(event.target.value))}
                    />
                </label>
            </PanelSection>
        </aside>
    );
}

type PanelSectionProps = {
    title: string;
    children: ReactNode;
};

function PanelSection({ title, children }: PanelSectionProps) {
    return (
        <section className="panel-section">
            <h3>{title}</h3>
            {children}
        </section>
    );
}

type ControlSliderProps = {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit: string;
    onChangeStart: () => void;
    onChangeEnd: () => void;
    onChange: (value: number) => void;
};

function ControlSlider({
    label,
    value,
    min,
    max,
    step,
    unit,
    onChangeStart,
    onChangeEnd,
    onChange,
}: ControlSliderProps) {
    return (
        <label className="slider-control">
            <div className="slider-header">
                <span>{label}</span>
                <strong>
                    {value}
                    {unit}
                </strong>
            </div>

            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onPointerDown={onChangeStart}
                onPointerUp={onChangeEnd}
                onPointerCancel={onChangeEnd}
                onBlur={onChangeEnd}
                onKeyDown={(event) => {
                    const historyKeys = [
                        "ArrowLeft",
                        "ArrowRight",
                        "ArrowUp",
                        "ArrowDown",
                        "Home",
                        "End",
                        "PageUp",
                        "PageDown",
                    ];

                    if (historyKeys.includes(event.key)) {
                        onChangeStart();
                    }
                }}
                onKeyUp={onChangeEnd}
                onChange={(event) => onChange(Number(event.target.value))}
            />
        </label>
    );
}