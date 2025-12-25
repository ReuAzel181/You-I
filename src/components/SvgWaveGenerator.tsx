"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useSettings } from "@/providers/SettingsProvider";

type SvgWaveGeneratorVariant = "hero" | "full";

type SvgWaveGeneratorProps = {
  variant?: SvgWaveGeneratorVariant;
};

type WavePosition = "top" | "bottom";

type WaveShape = "smooth" | "peaks";

type WavePoint = {
  x: number;
  y: number;
};

type RgbColor = {
  r: number;
  g: number;
  b: number;
};

type HslColor = {
  h: number;
  s: number;
  l: number;
};

type CopyNoticeState = {
  label: string;
  x: number;
  y: number;
};

type WaveParams = {
  width: number;
  height: number;
  intensity: number;
  baseHeight: number;
  seed: number;
  position: WavePosition;
  shape: WaveShape;
};

function parseHexColor(value: string): RgbColor | null {
  const hex = value.trim().replace(/^#/, "");

  if (hex.length !== 3 && hex.length !== 6) {
    return null;
  }

  const normalized =
    hex.length === 3 ? hex.split("").map((char) => char + char).join("") : hex;

  const int = Number.parseInt(normalized, 16);

  if (Number.isNaN(int)) {
    return null;
  }

  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;

  return { r, g, b };
}

function rgbToHex(color: RgbColor): string {
  const toHex = (channel: number) => channel.toString(16).padStart(2, "0");

  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

function rgbToHsl(color: RgbColor): HslColor {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;

    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    if (max === r) {
      h = (g - b) / d + (g < b ? 6 : 0);
    } else if (max === g) {
      h = (b - r) / d + 2;
    } else {
      h = (r - g) / d + 4;
    }

    h /= 6;
  }

  return { h, s, l };
}

function hslToRgb(color: HslColor): RgbColor {
  const h = color.h;
  const s = color.s;
  const l = color.l;

  if (s === 0) {
    const value = Math.round(l * 255);

    return { r: value, g: value, b: value };
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const hueToRgb = (t: number) => {
    let temp = t;

    if (temp < 0) {
      temp += 1;
    }

    if (temp > 1) {
      temp -= 1;
    }

    if (temp < 1 / 6) {
      return p + (q - p) * 6 * temp;
    }

    if (temp < 1 / 2) {
      return q;
    }

    if (temp < 2 / 3) {
      return p + (q - p) * (2 / 3 - temp) * 6;
    }

    return p;
  };

  const r = Math.round(hueToRgb(h + 1 / 3) * 255);
  const g = Math.round(hueToRgb(h) * 255);
  const b = Math.round(hueToRgb(h - 1 / 3) * 255);

  return { r, g, b };
}

function getHexLightness(value: string, fallback: string): number {
  const rgb = parseHexColor(value) ?? parseHexColor(fallback);

  if (!rgb) {
    return 50;
  }

  const { l } = rgbToHsl(rgb);

  return Math.round(l * 100);
}

function setHexLightness(value: string, fallback: string, lightnessPercent: number): string {
  const clamped = Math.min(100, Math.max(0, lightnessPercent));
  const rgb = parseHexColor(value) ?? parseHexColor(fallback);

  if (!rgb) {
    return fallback;
  }

  const hsl = rgbToHsl(rgb);
  const updated = hslToRgb({
    h: hsl.h,
    s: hsl.s,
    l: clamped / 100,
  });

  return rgbToHex(updated);
}

function createPseudoRandom(seed: number) {
  return (index: number) => {
    const value = Math.sin(seed * 9973 + index * 4271) * 10000;
    return value - Math.floor(value);
  };
}

function generateWavePoints(params: WaveParams): WavePoint[] {
  const { width, height, intensity, baseHeight, seed, shape } = params;

  const clampedIntensity = Math.min(1, Math.max(0, intensity));
  const random = createPseudoRandom(seed);

  const baseRange = height * 0.18;
  const verticalRange = baseRange * (0.3 + clampedIntensity * 1.7);

  const points: WavePoint[] = [];

  if (shape === "smooth") {
    const segmentCount = 64;
    const step = width / segmentCount;

    const frequencyBase = 1;
    const frequency = frequencyBase + Math.round(random(0) * 1);
    const phase = random(1) * Math.PI * 2;
    const phaseLong = random(2) * Math.PI * 2;
    const phaseDetail = random(3) * Math.PI * 2;

    for (let index = 0; index <= segmentCount; index += 1) {
      const x = step * index;
      const t = index / segmentCount;
      const angle = t * Math.PI * 2 * frequency + phase;
      const sine = Math.sin(angle);

      const long = Math.sin(t * Math.PI * 2 * 0.6 + phaseLong);
      const detail = Math.sin(angle * 2 + phaseDetail);
      const combined = (sine * 0.6 + long * 0.5 + detail * 0.3) / 1.4;
      const offset = combined * verticalRange;

      const y = baseHeight + offset;
      points.push({ x, y });
    }

    return points;
  }

  const peakCount = 8;
  const segmentCount = peakCount;
  const step = width / segmentCount;

  for (let index = 0; index <= segmentCount; index += 1) {
    const x = step * index;

    let offset: number;

    if (index === 0 || index === segmentCount) {
      offset = 0;
    } else {
      const direction = index % 2 === 0 ? 1 : -1;
      const magnitude = (0.4 + random(index) * 0.6) * verticalRange;
      offset = direction * magnitude;
    }

    const y = baseHeight + offset;
    points.push({ x, y });
  }

  return points;
}

function buildSmoothPathFromPoints(
  points: WavePoint[],
  width: number,
  height: number,
  position: WavePosition,
) {
  if (points.length === 0) {
    return "";
  }

  const topEdgeY = 0;
  const bottomEdgeY = height;
  const startY = position === "top" ? topEdgeY : bottomEdgeY;

  let path = `M 0 ${startY}`;

  const firstPoint = points[0];
  path += ` L ${firstPoint.x} ${firstPoint.y}`;

  if (points.length === 1) {
    if (position === "top") {
      path += ` L ${width} ${topEdgeY}`;
    } else {
      path += ` L ${width} ${bottomEdgeY}`;
    }

    path += " Z";
    return path;
  }

  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];

    const midX = (current.x + next.x) / 2;
    const midY = (current.y + next.y) / 2;

    path += ` Q ${current.x} ${current.y} ${midX} ${midY}`;
  }

  const lastPoint = points[points.length - 1];
  path += ` L ${lastPoint.x} ${lastPoint.y}`;

  if (position === "top") {
    path += ` L ${width} ${topEdgeY}`;
  } else {
    path += ` L ${width} ${bottomEdgeY}`;
  }

  path += " Z";

  return path;
}

function buildLinearPathFromPoints(
  points: WavePoint[],
  width: number,
  height: number,
  position: WavePosition,
) {
  if (points.length === 0) {
    return "";
  }

  const topEdgeY = 0;
  const bottomEdgeY = height;
  const startY = position === "top" ? topEdgeY : bottomEdgeY;

  let path = `M 0 ${startY}`;

  const firstPoint = points[0];
  path += ` L ${firstPoint.x} ${firstPoint.y}`;

  for (let index = 1; index < points.length; index += 1) {
    const point = points[index];
    path += ` L ${point.x} ${point.y}`;
  }

  if (position === "top") {
    path += ` L ${width} ${topEdgeY}`;
  } else {
    path += ` L ${width} ${bottomEdgeY}`;
  }

  path += " Z";

  return path;
}

function buildPathFromExistingPoints(
  points: WavePoint[],
  width: number,
  height: number,
  position: WavePosition,
  shape: WaveShape,
) {
  if (shape === "smooth") {
    return buildSmoothPathFromPoints(points, width, height, position);
  }

  return buildLinearPathFromPoints(points, width, height, position);
}

export function SvgWaveGenerator({ variant = "full" }: SvgWaveGeneratorProps) {
  const { nudgeAmount } = useSettings();
  const effectiveNudgeAmount =
    Number.isFinite(nudgeAmount) && nudgeAmount > 0 ? nudgeAmount : 8;
  const [hasHydrated, setHasHydrated] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const positionToggleRef = useRef<HTMLDivElement | null>(null);
  const downloadToggleRef = useRef<HTMLDivElement | null>(null);
  const positionTopRef = useRef<HTMLButtonElement | null>(null);
  const positionBottomRef = useRef<HTMLButtonElement | null>(null);
  const downloadSvgRef = useRef<HTMLButtonElement | null>(null);
  const downloadPngRef = useRef<HTMLButtonElement | null>(null);
  const downloadJpgRef = useRef<HTMLButtonElement | null>(null);
  const [positionPillStyle, setPositionPillStyle] = useState<{
    left: number;
    width: number;
  } | null>(null);
  const shapeToggleRef = useRef<HTMLDivElement | null>(null);
  const shapeSmoothRef = useRef<HTMLButtonElement | null>(null);
  const shapePeaksRef = useRef<HTMLButtonElement | null>(null);
  const [shapePillStyle, setShapePillStyle] = useState<{
    left: number;
    width: number;
  } | null>(null);
  const [downloadPillStyle, setDownloadPillStyle] = useState<{
    left: number;
    width: number;
  } | null>(null);
  const [position, setPosition] = useState<WavePosition>("bottom");
  const [shape, setShape] = useState<WaveShape>("smooth");
  const [heightValue, setHeightValue] = useState("220");
  const [intensityValue, setIntensityValue] = useState("0.6");
  const [fillColor, setFillColor] = useState("#f97373");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [outputWidthValue, setOutputWidthValue] = useState("1440");
  const [outputHeightValue, setOutputHeightValue] = useState("320");
  const [seed, setSeed] = useState(1);
  const [downloadLabel, setDownloadLabel] = useState<"Download" | "Downloading">(
    "Download",
  );
  const [previousFillColorValue, setPreviousFillColorValue] = useState("#f97373");
  const [previousBackgroundColorValue, setPreviousBackgroundColorValue] =
    useState("#ffffff");
  const [isFillTransparent, setIsFillTransparent] = useState(false);
  const [isBackgroundTransparent, setIsBackgroundTransparent] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<"svg" | "png" | "jpg">("svg");
  const [downloadIconSrc, setDownloadIconSrc] = useState(
    "/icons/download/download-black.svg",
  );

  const svgWidth = 1440;
  const svgHeight = 320;

  type WaveConfig = {
    seed: number;
    position: WavePosition;
    shape: WaveShape;
    heightValue: string;
    intensityValue: string;
    fillColor: string;
    backgroundColor: string;
    outputWidthValue: string;
    outputHeightValue: string;
  };

  const [previousConfig, setPreviousConfig] = useState<WaveConfig | null>(null);
  const [copyNotice, setCopyNotice] = useState<CopyNoticeState | null>(null);
  const copyNoticeTimeoutRef = useRef<number | null>(null);
  const currentPointsRef = useRef<WavePoint[]>([]);
  const [currentPath, setCurrentPath] = useState(() => {
    const initialHeight = 220;
    const initialIntensity = 0.6;

    const initialParams: WaveParams = {
      width: svgWidth,
      height: svgHeight,
      intensity: initialIntensity,
      baseHeight: svgHeight - initialHeight,
      seed: 1,
      position: "bottom",
      shape: "smooth",
    };

    const initialPoints = generateWavePoints(initialParams);

    return buildPathFromExistingPoints(
      initialPoints,
      svgWidth,
      svgHeight,
      initialParams.position,
      initialParams.shape,
    );
  });
  const isMorphingRef = useRef(false);
  const morphFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setHasHydrated(true);
    }, 0);

    return () => {
      window.clearTimeout(id);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;

    const updateIcon = () => {
      const theme = root.getAttribute("data-theme");
      setDownloadIconSrc(
        theme === "dark"
          ? "/icons/download/download-white.svg"
          : "/icons/download/download-black.svg",
      );
    };

    updateIcon();

    const observer = new MutationObserver(updateIcon);

    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const container = positionToggleRef.current;
    const activeButton =
      position === "top" ? positionTopRef.current : positionBottomRef.current;

    if (!container || !activeButton) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const activeRect = activeButton.getBoundingClientRect();

    setPositionPillStyle({
      left: activeRect.left - containerRect.left,
      width: activeRect.width,
    });
  }, [position]);

  useEffect(() => {
    const container = shapeToggleRef.current;
    const activeButton =
      shape === "smooth" ? shapeSmoothRef.current : shapePeaksRef.current;

    if (!container || !activeButton) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const activeRect = activeButton.getBoundingClientRect();

    setShapePillStyle({
      left: activeRect.left - containerRect.left,
      width: activeRect.width,
    });
  }, [shape]);

  useEffect(() => {
    const container = downloadToggleRef.current;
    const activeButton =
      downloadFormat === "svg"
        ? downloadSvgRef.current
        : downloadFormat === "png"
          ? downloadPngRef.current
          : downloadJpgRef.current;

    if (!container || !activeButton) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const activeRect = activeButton.getBoundingClientRect();

    setDownloadPillStyle({
      left: activeRect.left - containerRect.left,
      width: activeRect.width,
    });
  }, [downloadFormat]);

  const numericHeight = useMemo(() => {
    const parsed = Number.parseFloat(heightValue);

    if (!Number.isFinite(parsed) || parsed <= 40) {
      return 120;
    }

    if (parsed > 320) {
      return 320;
    }

    return parsed;
  }, [heightValue]);

  const numericIntensity = useMemo(() => {
    const parsed = Number.parseFloat(intensityValue);

    if (!Number.isFinite(parsed) || parsed < 0) {
      return 0.2;
    }

    if (parsed > 1) {
      return 1;
    }

    return parsed;
  }, [intensityValue]);

  const numericOutputWidth = useMemo(() => {
    const parsed = Number.parseInt(outputWidthValue, 10);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return svgWidth;
    }

    if (parsed > 8192) {
      return 8192;
    }

    return parsed;
  }, [outputWidthValue, svgWidth]);

  const numericOutputHeight = useMemo(() => {
    const parsed = Number.parseInt(outputHeightValue, 10);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return svgHeight;
    }

    if (parsed > 4096) {
      return 4096;
    }

    return parsed;
  }, [outputHeightValue, svgHeight]);

  const baseHeight = useMemo(() => {
    if (position === "bottom") {
      return svgHeight - numericHeight;
    }

    return numericHeight;
  }, [numericHeight, position, svgHeight]);

  function morphBetweenParams(
    fromParams: WaveParams,
    toParams: WaveParams,
    onComplete?: () => void,
  ) {
    const fromPoints =
      currentPointsRef.current.length > 0
        ? currentPointsRef.current
        : generateWavePoints(fromParams);
    const toPoints = generateWavePoints(toParams);

    if (morphFrameRef.current !== null) {
      cancelAnimationFrame(morphFrameRef.current);
      morphFrameRef.current = null;
    }

    isMorphingRef.current = true;

    const start = performance.now();
    const duration = 520;

    function step(now: number) {
      const elapsed = now - start;
      const ratio = Math.min(1, Math.max(0, elapsed / duration));
      const eased =
        ratio < 0.5 ? 2 * ratio * ratio : 1 - Math.pow(-2 * ratio + 2, 2) / 2;

      const blended: WavePoint[] = [];
      const maxLength = Math.max(fromPoints.length, toPoints.length);

      for (let index = 0; index < maxLength; index += 1) {
        const from = fromPoints[Math.min(index, fromPoints.length - 1)];
        const to = toPoints[Math.min(index, toPoints.length - 1)];

        const x = from.x + (to.x - from.x) * eased;
        const y = from.y + (to.y - from.y) * eased;

        blended.push({ x, y });
      }

      currentPointsRef.current = blended;

      setCurrentPath(
        buildPathFromExistingPoints(
          blended,
          svgWidth,
          svgHeight,
          toParams.position,
          toParams.shape,
        ),
      );

      if (ratio < 1) {
        morphFrameRef.current = requestAnimationFrame(step);
      } else {
        isMorphingRef.current = false;
        currentPointsRef.current = toPoints;
        setCurrentPath(
          buildPathFromExistingPoints(
            toPoints,
            svgWidth,
            svgHeight,
            toParams.position,
            toParams.shape,
          ),
        );
        morphFrameRef.current = null;
        if (onComplete) {
          onComplete();
        }
      }
    }

    morphFrameRef.current = requestAnimationFrame(step);
  }

  const svgMarkup = useMemo(
    () =>
      `<svg xmlns="http://www.w3.org/2000/svg" width="${numericOutputWidth}" height="${numericOutputHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="none">\n  <path fill="${fillColor}" d="${currentPath}" />\n</svg>`,
    [fillColor, currentPath, numericOutputWidth, numericOutputHeight, svgWidth, svgHeight],
  );

  const waveSwatchColor =
    fillColor === "transparent"
      ? previousFillColorValue || "#f97373"
      : fillColor || "#f97373";

  const backgroundSwatchColor =
    backgroundColor === "transparent"
      ? previousBackgroundColorValue || "#ffffff"
      : backgroundColor || "#ffffff";

  const containerPadding = variant === "full" ? "p-5 sm:p-6" : "";
  const containerChrome =
    variant === "full" ? "rounded-2xl border border-zinc-200 bg-white" : "";
  const layoutDirection = variant === "full" ? "lg:flex-row" : "lg:flex-col";
  const controlsLayoutWidth =
    variant === "full" ? "lg:w-[320px] lg:flex-none" : "w-full";

  function handleRandomize() {
    setPreviousConfig({
      seed,
      position,
      shape,
      heightValue,
      intensityValue,
      fillColor,
      backgroundColor,
      outputWidthValue,
      outputHeightValue,
    });

    const nextSeed = seed + 1;

    const fromParams: WaveParams = {
      width: svgWidth,
      height: svgHeight,
      intensity: numericIntensity,
      baseHeight,
      seed,
      position,
      shape,
    };

    const toParams: WaveParams = {
      width: svgWidth,
      height: svgHeight,
      intensity: numericIntensity,
      baseHeight,
      seed: nextSeed,
      position,
      shape,
    };

    morphBetweenParams(fromParams, toParams, () => {
      setSeed(nextSeed);
    });
  }

  function handleHeightChange(nextValue: string) {
    const parsed = Number.parseFloat(nextValue);

    let nextHeight = parsed;

    if (!Number.isFinite(nextHeight) || nextHeight <= 40) {
      nextHeight = 120;
    } else if (nextHeight > 320) {
      nextHeight = 320;
    }

    const nextBaseHeight = position === "bottom" ? svgHeight - nextHeight : nextHeight;

    const fromParams: WaveParams = {
      width: svgWidth,
      height: svgHeight,
      intensity: numericIntensity,
      baseHeight,
      seed,
      position,
      shape,
    };

    const toParams: WaveParams = {
      width: svgWidth,
      height: svgHeight,
      intensity: numericIntensity,
      baseHeight: nextBaseHeight,
      seed,
      position,
      shape,
    };

    setHeightValue(nextValue);

    morphBetweenParams(fromParams, toParams, () => {
      setHeightValue(nextValue);
    });
  }

  function handleIntensityChange(nextValue: string) {
    const parsed = Number.parseFloat(nextValue);

    let nextIntensity = parsed;

    if (!Number.isFinite(nextIntensity) || nextIntensity < 0) {
      nextIntensity = 0.2;
    } else if (nextIntensity > 1) {
      nextIntensity = 1;
    }

    const fromParams: WaveParams = {
      width: svgWidth,
      height: svgHeight,
      intensity: numericIntensity,
      baseHeight,
      seed,
      position,
      shape,
    };

    const toParams: WaveParams = {
      width: svgWidth,
      height: svgHeight,
      intensity: nextIntensity,
      baseHeight,
      seed,
      position,
      shape,
    };

    setIntensityValue(nextValue);

    morphBetweenParams(fromParams, toParams, () => {
      setIntensityValue(nextValue);
    });
  }

  function handleOutputWidthKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
      return;
    }

    event.preventDefault();

    const step = event.shiftKey ? effectiveNudgeAmount : 1;
    const current = numericOutputWidth;
    const next = event.key === "ArrowUp" ? current + step : current - step;

    if (next < 120 || next > 8192) {
      return;
    }

    setOutputWidthValue(String(next));
  }

  function handleOutputHeightKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
      return;
    }

    event.preventDefault();

    const step = event.shiftKey ? effectiveNudgeAmount : 1;
    const current = numericOutputHeight;
    const next = event.key === "ArrowUp" ? current + step : current - step;

    if (next < 80 || next > 4096) {
      return;
    }

    setOutputHeightValue(String(next));
  }

  function handlePositionChange(nextPosition: WavePosition) {
    if (nextPosition === position) {
      return;
    }

    const currentBaseHeight =
      position === "bottom" ? svgHeight - numericHeight : numericHeight;

    const nextBaseHeight =
      nextPosition === "bottom" ? svgHeight - numericHeight : numericHeight;

    const fromParams: WaveParams = {
      width: svgWidth,
      height: svgHeight,
      intensity: numericIntensity,
      baseHeight: currentBaseHeight,
      seed,
      position,
      shape,
    };

    const toParams: WaveParams = {
      width: svgWidth,
      height: svgHeight,
      intensity: numericIntensity,
      baseHeight: nextBaseHeight,
      seed,
      position: nextPosition,
      shape,
    };

    setPosition(nextPosition);
    morphBetweenParams(fromParams, toParams);
  }

  function handleShapeChange(nextShape: WaveShape) {
    if (nextShape === shape) {
      return;
    }

    const fromParams: WaveParams = {
      width: svgWidth,
      height: svgHeight,
      intensity: numericIntensity,
      baseHeight,
      seed,
      position,
      shape,
    };

    const toParams: WaveParams = {
      width: svgWidth,
      height: svgHeight,
      intensity: numericIntensity,
      baseHeight,
      seed,
      position,
      shape: nextShape,
    };

    setShape(nextShape);
    morphBetweenParams(fromParams, toParams);
  }

  function handleCopy(event: React.MouseEvent<HTMLElement>) {
    if (typeof navigator === "undefined" || typeof navigator.clipboard === "undefined") {
      return;
    }

    navigator.clipboard.writeText(svgMarkup).then(
      () => {
        const card = cardRef.current;

        if (card) {
          const rect = card.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top - 16;

          setCopyNotice({ label: "Copied", x, y });
        } else {
          setCopyNotice({
            label: "Copied",
            x: 0,
            y: 0,
          });
        }

        if (copyNoticeTimeoutRef.current !== null) {
          window.clearTimeout(copyNoticeTimeoutRef.current);
        }

        copyNoticeTimeoutRef.current = window.setTimeout(() => {
          setCopyNotice(null);
          copyNoticeTimeoutRef.current = null;
        }, 1500);
      },
      () => {},
    );
  }

  function handleRestorePrevious() {
    if (!previousConfig) {
      return;
    }

    const nextHeight = Number.parseFloat(previousConfig.heightValue);
    const clampedHeight =
      !Number.isFinite(nextHeight) || nextHeight <= 40
        ? 120
        : Math.min(320, nextHeight);

    const nextIntensityRaw = Number.parseFloat(previousConfig.intensityValue);
    const clampedIntensity =
      !Number.isFinite(nextIntensityRaw) || nextIntensityRaw < 0
        ? 0.2
        : Math.min(1, nextIntensityRaw);

    const nextBaseHeight =
      previousConfig.position === "bottom"
        ? svgHeight - clampedHeight
        : clampedHeight;

    const toParams: WaveParams = {
      width: svgWidth,
      height: svgHeight,
      intensity: clampedIntensity,
      baseHeight: nextBaseHeight,
      seed: previousConfig.seed,
      position: previousConfig.position,
      shape: previousConfig.shape,
    };

    morphBetweenParams(
      {
        width: svgWidth,
        height: svgHeight,
        intensity: numericIntensity,
        baseHeight,
        seed,
        position,
        shape,
      },
      toParams,
      () => {
        setPosition(previousConfig.position);
        setShape(previousConfig.shape);
        setHeightValue(previousConfig.heightValue);
        setIntensityValue(previousConfig.intensityValue);
        setFillColor(previousConfig.fillColor);
        setBackgroundColor(previousConfig.backgroundColor);
        setOutputWidthValue(previousConfig.outputWidthValue);
        setOutputHeightValue(previousConfig.outputHeightValue);
        setPreviousConfig(null);
      },
    );
  }

  function handleDownload(format: "svg" | "png" | "jpg") {
    if (typeof window === "undefined") {
      return;
    }

    if (format === "svg") {
      try {
        const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");

        anchor.href = url;
        anchor.download = "wave.svg";

        document.body.appendChild(anchor);
        setDownloadLabel("Downloading");
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);

        window.setTimeout(() => {
          setDownloadLabel("Download");
        }, 800);
      } catch {
        setDownloadLabel("Download");
      }

      return;
    }

    try {
      setDownloadLabel("Downloading");

      const svgBlob = new Blob([svgMarkup], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);
      const image = new window.Image();

      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = numericOutputWidth;
        canvas.height = numericOutputHeight;

        const context = canvas.getContext("2d");

        if (!context) {
          URL.revokeObjectURL(url);
          setDownloadLabel("Download");
          return;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);

        if (format === "jpg") {
          const fillColorForJpg =
            backgroundColor === "transparent" ? "#ffffff" : backgroundColor;
          context.fillStyle = fillColorForJpg;
          context.fillRect(0, 0, canvas.width, canvas.height);
        } else if (backgroundColor !== "transparent") {
          context.fillStyle = backgroundColor;
          context.fillRect(0, 0, canvas.width, canvas.height);
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);

        const mimeType = format === "png" ? "image/png" : "image/jpeg";

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              setDownloadLabel("Download");
              return;
            }

            const blobUrl = URL.createObjectURL(blob);
            const anchor = document.createElement("a");

            anchor.href = blobUrl;
            anchor.download = format === "png" ? "wave.png" : "wave.jpg";

            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            URL.revokeObjectURL(blobUrl);

            window.setTimeout(() => {
              setDownloadLabel("Download");
            }, 800);
          },
          mimeType,
        );
      };

      image.onerror = () => {
        URL.revokeObjectURL(url);
        setDownloadLabel("Download");
      };

      image.src = url;
    } catch {
      setDownloadLabel("Download");
    }
  }

  if (!hasHydrated) {
    const placeholderHeight =
      variant === "hero" ? "h-52 sm:h-60 md:h-80" : "h-64 sm:h-72 md:h-96";

    return (
      <div
        ref={cardRef}
        className={`${containerChrome} ${containerPadding} relative animate-pulse`}
      >
        <div className={`flex flex-col gap-4 ${layoutDirection}`}>
          <div className={`space-y-4 ${controlsLayoutWidth}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                <span className="h-1.5 w-1.5 rounded-full bg-red-200" />
                <span>Loading wave generator</span>
              </div>
            </div>
            <div className="space-y-3 text-[11px] text-zinc-400">
              <div className="h-3 w-40 rounded-full bg-zinc-200" />
              <div className="h-3 w-52 rounded-full bg-zinc-200" />
              <div className="h-3 w-32 rounded-full bg-zinc-200" />
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="h-3 w-24 rounded-full bg-zinc-200" />
                  {variant === "full" && (
                    <div className="h-3 w-40 rounded-full bg-zinc-200" />
                  )}
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-dashed border-zinc-200 bg-zinc-50">
              <div className={`w-full ${placeholderHeight}`} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={cardRef} className={`${containerChrome} ${containerPadding} relative`}>
      <div className={`flex flex-col gap-4 ${layoutDirection}`}>
        <div className={`space-y-4 ${controlsLayoutWidth}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              <span>SVG Wave Generator</span>
            </div>
          </div>
          <div className="space-y-3 text-[11px] text-zinc-700">
            {variant === "hero" ? (
              <>
                <div className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRandomize}
                      className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-[10px] font-medium text-zinc-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                    >
                      Randomize
                    </button>
                    <button
                      type="button"
                      onClick={handleRestorePrevious}
                      disabled={!previousConfig}
                      aria-disabled={!previousConfig}
                      className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-[10px] font-medium transition-colors ${
                        previousConfig
                          ? "border-zinc-200 bg-white text-zinc-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                          : "cursor-not-allowed border-zinc-100 bg-zinc-50 text-zinc-400"
                      }`}
                    >
                      Previous
                    </button>
                  </div>
                  <span className="mx-auto h-6 w-px bg-zinc-200" />
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <div
                      ref={positionToggleRef}
                      className="relative inline-flex rounded-full border border-zinc-200 bg-white p-0.5 text-[10px]"
                    >
                      <span
                        className={`absolute inset-y-0 my-0.5 rounded-full bg-red-500 shadow-sm transition-all duration-150 ${
                          positionPillStyle ? "opacity-100" : "opacity-0"
                        }`}
                        style={
                          positionPillStyle
                            ? {
                                left: positionPillStyle.left,
                                width: positionPillStyle.width,
                              }
                            : undefined
                        }
                      />
                      <button
                        type="button"
                        ref={positionTopRef}
                        onClick={() => handlePositionChange("top")}
                        className={`relative z-10 rounded-full px-2.5 py-1 transition-colors duration-150 ${
                          position === "top"
                            ? "text-white"
                            : "text-zinc-600 hover:text-zinc-800"
                        }`}
                      >
                        Top
                      </button>
                      <button
                        type="button"
                        ref={positionBottomRef}
                        onClick={() => handlePositionChange("bottom")}
                        className={`relative z-10 rounded-full px-2.5 py-1 transition-colors duration-150 ${
                          position === "bottom"
                            ? "text-white"
                            : "text-zinc-600 hover:text-zinc-800"
                        }`}
                      >
                        Bottom
                      </button>
                    </div>
                    <div
                      ref={shapeToggleRef}
                      className="relative inline-flex rounded-full border border-zinc-200 bg-white p-0.5 text-[10px]"
                    >
                      <span
                        className={`absolute inset-y-0 my-0.5 rounded-full bg-red-500 shadow-sm transition-all duration-150 ${
                          shapePillStyle ? "opacity-100" : "opacity-0"
                        }`}
                        style={
                          shapePillStyle
                            ? {
                                left: shapePillStyle.left,
                                width: shapePillStyle.width,
                              }
                            : undefined
                        }
                      />
                      <button
                        type="button"
                        ref={shapeSmoothRef}
                        onClick={() => handleShapeChange("smooth")}
                        className={`relative z-10 rounded-full px-2.5 py-1 transition-colors duration-150 ${
                          shape === "smooth"
                            ? "text-white"
                            : "text-zinc-600 hover:text-zinc-800"
                        }`}
                      >
                        Smooth
                      </button>
                      <button
                        type="button"
                        ref={shapePeaksRef}
                        onClick={() => handleShapeChange("peaks")}
                        className={`relative z-10 rounded-full px-2.5 py-1 transition-colors duration-150 ${
                          shape === "peaks"
                            ? "text-white"
                            : "text-zinc-600 hover:text-zinc-800"
                        }`}
                      >
                        Zigzag
                      </button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                      Wave height
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={80}
                        max={320}
                        value={numericHeight}
                        onChange={(event) => handleHeightChange(event.target.value)}
                        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-zinc-200"
                      />
                      <input
                        type="number"
                        min={80}
                        max={320}
                        value={numericHeight}
                        onChange={(event) => handleHeightChange(event.target.value)}
                        className="font-size-input w-16 rounded-md border border-zinc-200 bg-white px-2 py-1 text-right text-[11px] text-zinc-700 outline-none ring-0 focus:border-red-400"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                      Curvature
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={numericIntensity}
                        onChange={(event) => handleIntensityChange(event.target.value)}
                        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-zinc-200"
                      />
                      <input
                        type="number"
                        min={0}
                        max={1}
                        step={0.05}
                        value={numericIntensity}
                        onChange={(event) => handleIntensityChange(event.target.value)}
                        className="font-size-input w-16 rounded-md border border-zinc-200 bg-white px-2 py-1 text-right text-[11px] text-zinc-700 outline-none ring-0 focus:border-red-400"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                      Wave color
                    </label>
                    <div className="flex h-9 items-center gap-2">
                      <label className="relative inline-flex h-full w-9 cursor-pointer items-center justify-center overflow-hidden rounded border border-zinc-400">
                        <span className="sr-only">Wave color</span>
                        <span
                          className="absolute inset-0"
                          style={{ backgroundColor: waveSwatchColor }}
                        />
                        <input
                          type="color"
                          value={waveSwatchColor}
                          onChange={(event) => {
                            const next = event.target.value;
                            setIsFillTransparent(false);
                            setPreviousFillColorValue(next);
                            setFillColor(next);
                          }}
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                          aria-label="Wave color"
                        />
                      </label>
                      <input
                        type="text"
                        value={fillColor}
                        onChange={(event) => {
                          const next = event.target.value;
                          setIsFillTransparent(false);
                          setPreviousFillColorValue(next);
                          setFillColor(next);
                        }}
                        onKeyDown={(event) => {
                          if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
                            return;
                          }

                          event.preventDefault();

                          const direction = event.key === "ArrowUp" ? 1 : -1;
                          const step = event.shiftKey ? effectiveNudgeAmount : 1;

                          setIsFillTransparent(false);
                          setFillColor((current) => {
                            const lightness = getHexLightness(current, "#f97373");
                            const nextLightness = lightness + direction * step;
                            const nextColor = setHexLightness(
                              current,
                              "#f97373",
                              nextLightness,
                            );
                            setPreviousFillColorValue(nextColor);
                            return nextColor;
                          });
                        }}
                        className="h-full w-full flex-1 min-w-0 rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 outline-none ring-0 placeholder:text-zinc-400 focus:border-red-400"
                        placeholder="#f97373"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (isFillTransparent) {
                            setFillColor(previousFillColorValue);
                            setIsFillTransparent(false);
                          } else {
                            setFillColor("transparent");
                            setIsFillTransparent(true);
                          }
                        }}
                        className={`inline-flex h-full items-center justify-center rounded-full border px-2.5 text-[10px] font-medium transition-colors ${
                          isFillTransparent
                            ? "border-red-300 bg-red-50 text-red-700"
                            : "border-zinc-200 bg-white text-zinc-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                        }`}
                      >
                        Transparent
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                      Background color
                    </label>
                    <div className="flex h-9 items-center gap-2">
                      <label className="relative inline-flex h-full w-9 cursor-pointer items-center justify-center overflow-hidden rounded border border-zinc-400">
                        <span className="sr-only">Background color</span>
                        <span
                          className="absolute inset-0"
                          style={{ backgroundColor: backgroundSwatchColor }}
                        />
                        <input
                          type="color"
                          value={backgroundSwatchColor}
                          onChange={(event) => {
                            const next = event.target.value;
                            setIsBackgroundTransparent(false);
                            setPreviousBackgroundColorValue(next);
                            setBackgroundColor(next);
                          }}
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                          aria-label="Background color"
                        />
                      </label>
                      <input
                        type="text"
                        value={backgroundColor}
                        onChange={(event) => {
                          const next = event.target.value;
                          setIsBackgroundTransparent(false);
                          setPreviousBackgroundColorValue(next);
                          setBackgroundColor(next);
                        }}
                        onKeyDown={(event) => {
                          if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
                            return;
                          }

                          event.preventDefault();

                          const direction = event.key === "ArrowUp" ? 1 : -1;
                          const step = event.shiftKey ? effectiveNudgeAmount : 1;

                          setIsBackgroundTransparent(false);
                          setBackgroundColor((current) => {
                            const lightness = getHexLightness(current, "#ffffff");
                            const nextLightness = lightness + direction * step;
                            const nextColor = setHexLightness(
                              current,
                              "#ffffff",
                              nextLightness,
                            );
                            setPreviousBackgroundColorValue(nextColor);
                            return nextColor;
                          });
                        }}
                        className="h-full w-full flex-1 min-w-0 rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 outline-none ring-0 placeholder:text-zinc-400 focus:border-red-400"
                        placeholder="#ffffff"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (isBackgroundTransparent) {
                            setBackgroundColor(previousBackgroundColorValue);
                            setIsBackgroundTransparent(false);
                          } else {
                            setBackgroundColor("transparent");
                            setIsBackgroundTransparent(true);
                          }
                        }}
                        className={`inline-flex h-full items-center justify-center rounded-full border px-2.5 text-[10px] font-medium transition-colors ${
                          isBackgroundTransparent
                            ? "border-red-300 bg-red-50 text-red-700"
                            : "border-zinc-200 bg-white text-zinc-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                        }`}
                      >
                        Transparent
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                    State
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRandomize}
                      className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-[10px] font-medium text-zinc-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                    >
                      Randomize
                    </button>
                    <button
                      type="button"
                      onClick={handleRestorePrevious}
                      disabled={!previousConfig}
                      aria-disabled={!previousConfig}
                      className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-[10px] font-medium transition-colors ${
                        previousConfig
                          ? "border-zinc-200 bg-white text-zinc-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                          : "cursor-not-allowed border-zinc-100 bg-zinc-50 text-zinc-400"
                      }`}
                    >
                      Previous
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                      Wave position
                    </p>
                    <div
                      ref={positionToggleRef}
                      className="relative inline-flex rounded-full border border-zinc-200 bg-white p-0.5 text-[10px]"
                    >
                      <span
                        className={`absolute inset-y-0 my-0.5 rounded-full bg-red-500 shadow-sm transition-all duration-150 ${
                          positionPillStyle ? "opacity-100" : "opacity-0"
                        }`}
                        style={
                          positionPillStyle
                            ? {
                                left: positionPillStyle.left,
                                width: positionPillStyle.width,
                              }
                            : undefined
                        }
                      />
                      <button
                        type="button"
                        ref={positionTopRef}
                        onClick={() => handlePositionChange("top")}
                        className={`relative z-10 rounded-full px-2.5 py-1 transition-colors duration-150 ${
                          position === "top"
                            ? "text-white"
                            : "text-zinc-600 hover:text-zinc-800"
                        }`}
                      >
                        Top
                      </button>
                      <button
                        type="button"
                        ref={positionBottomRef}
                        onClick={() => handlePositionChange("bottom")}
                        className={`relative z-10 rounded-full px-2.5 py-1 transition-colors duration-150 ${
                          position === "bottom"
                            ? "text-white"
                            : "text-zinc-600 hover:text-zinc-800"
                        }`}
                      >
                        Bottom
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                      Wave style
                    </p>
                    <div
                      ref={shapeToggleRef}
                      className="relative inline-flex rounded-full border border-zinc-200 bg-white p-0.5 text-[10px]"
                    >
                      <span
                        className={`absolute inset-y-0 my-0.5 rounded-full bg-red-500 shadow-sm transition-all duration-150 ${
                          shapePillStyle ? "opacity-100" : "opacity-0"
                        }`}
                        style={
                          shapePillStyle
                            ? {
                                left: shapePillStyle.left,
                                width: shapePillStyle.width,
                              }
                            : undefined
                        }
                      />
                      <button
                        type="button"
                        ref={shapeSmoothRef}
                        onClick={() => handleShapeChange("smooth")}
                        className={`relative z-10 rounded-full px-2.5 py-1 transition-colors duration-150 ${
                          shape === "smooth"
                            ? "text-white"
                            : "text-zinc-600 hover:text-zinc-800"
                        }`}
                      >
                        Smooth
                      </button>
                      <button
                        type="button"
                        ref={shapePeaksRef}
                        onClick={() => handleShapeChange("peaks")}
                        className={`relative z-10 rounded-full px-2.5 py-1 transition-colors duration-150 ${
                          shape === "peaks"
                            ? "text-white"
                            : "text-zinc-600 hover:text-zinc-800"
                        }`}
                      >
                        Zigzag
                      </button>
                    </div>
                  </div>
                </div>
                {variant === "full" && (
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                      SVG size
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">
                          W
                        </span>
                        <input
                          type="number"
                          min={120}
                          max={8192}
                          value={numericOutputWidth}
                          onChange={(event) => setOutputWidthValue(event.target.value)}
                          onKeyDown={handleOutputWidthKeyDown}
                          className="font-size-input w-full rounded-md border border-zinc-200 bg-white px-6 py-1 text-right text-[11px] text-zinc-700 outline-none ring-0 focus:border-red-400"
                        />
                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">
                          px
                        </span>
                      </div>
                      <span className="h-4 w-px bg-zinc-200" />
                      <div className="relative flex-1">
                        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">
                          H
                        </span>
                        <input
                          type="number"
                          min={80}
                          max={4096}
                          value={numericOutputHeight}
                          onChange={(event) => setOutputHeightValue(event.target.value)}
                          onKeyDown={handleOutputHeightKeyDown}
                          className="font-size-input w-full rounded-md border border-zinc-200 bg-white px-6 py-1 text-right text-[11px] text-zinc-700 outline-none ring-0 focus:border-red-400"
                        />
                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">
                          px
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-500">
                      Width and height attributes added to the exported SVG.
                    </p>
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                    Wave height
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={80}
                      max={320}
                      value={numericHeight}
                      onChange={(event) => handleHeightChange(event.target.value)}
                      className="h-1 w-full cursor-pointer appearance-none rounded-full bg-zinc-200"
                    />
                    <input
                      type="number"
                      min={80}
                      max={320}
                      value={numericHeight}
                      onChange={(event) => handleHeightChange(event.target.value)}
                      className="font-size-input w-16 rounded-md border border-zinc-200 bg-white px-2 py-1 text-right text-[11px] text-zinc-700 outline-none ring-0 focus:border-red-400"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    Controls how tall the wave is.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                    Curvature
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={numericIntensity}
                      onChange={(event) => handleIntensityChange(event.target.value)}
                      className="h-1 w-full cursor-pointer appearance-none rounded-full bg-zinc-200"
                    />
                    <input
                      type="number"
                      min={0}
                      max={1}
                      step={0.05}
                      value={numericIntensity}
                      onChange={(event) => handleIntensityChange(event.target.value)}
                      className="font-size-input w-16 rounded-md border border-zinc-200 bg-white px-2 py-1 text-right text-[11px] text-zinc-700 outline-none ring-0 focus:border-red-400"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    Lower values are gentle; higher values are more dramatic.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                    Wave color
                  </label>
                  <div className="flex h-9 items-center gap-2">
                    <label className="relative inline-flex h-full w-9 cursor-pointer items-center justify-center overflow-hidden rounded border border-zinc-400">
                      <span className="sr-only">Wave color</span>
                      <span
                        className="absolute inset-0"
                        style={{ backgroundColor: waveSwatchColor }}
                      />
                      <input
                        type="color"
                        value={waveSwatchColor}
                        onChange={(event) => {
                          const next = event.target.value;
                          setIsFillTransparent(false);
                          setPreviousFillColorValue(next);
                          setFillColor(next);
                        }}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        aria-label="Wave color"
                      />
                    </label>
                    <input
                      type="text"
                      value={fillColor}
                      onChange={(event) => {
                        const next = event.target.value;
                        setIsFillTransparent(false);
                        setPreviousFillColorValue(next);
                        setFillColor(next);
                      }}
                      onKeyDown={(event) => {
                        if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
                          return;
                        }

                        event.preventDefault();

                        const direction = event.key === "ArrowUp" ? 1 : -1;
                        const step = event.shiftKey ? effectiveNudgeAmount : 1;

                        setIsFillTransparent(false);
                        setFillColor((current) => {
                          const lightness = getHexLightness(current, "#f97373");
                          const nextLightness = lightness + direction * step;
                          const nextColor = setHexLightness(
                            current,
                            "#f97373",
                            nextLightness,
                          );
                          setPreviousFillColorValue(nextColor);
                          return nextColor;
                        });
                      }}
                      className="h-full w-full flex-1 min-w-0 rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 outline-none ring-0 placeholder:text-zinc-400 focus:border-red-400"
                      placeholder="#f97373"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (isFillTransparent) {
                          setFillColor(previousFillColorValue);
                          setIsFillTransparent(false);
                        } else {
                          setFillColor("transparent");
                          setIsFillTransparent(true);
                        }
                      }}
                      className={`inline-flex h-full items-center justify-center rounded-full border px-2.5 text-[10px] font-medium transition-colors ${
                        isFillTransparent
                          ? "border-red-300 bg-red-50 text-red-700"
                          : "border-zinc-200 bg-white text-zinc-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                      }`}
                    >
                      Transparent
                    </button>
                  </div>
                </div>
                {variant === "full" && (
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                      Background color
                    </label>
                    <div className="flex h-9 items-center gap-2">
                      <label className="relative inline-flex h-full w-9 cursor-pointer items-center justify-center overflow-hidden rounded border border-zinc-400">
                        <span className="sr-only">Background color</span>
                        <span
                          className="absolute inset-0"
                          style={{ backgroundColor: backgroundSwatchColor }}
                        />
                        <input
                          type="color"
                          value={backgroundSwatchColor}
                          onChange={(event) => {
                            const next = event.target.value;
                            setIsBackgroundTransparent(false);
                            setPreviousBackgroundColorValue(next);
                            setBackgroundColor(next);
                          }}
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                          aria-label="Background color"
                        />
                      </label>
                      <input
                        type="text"
                        value={backgroundColor}
                        onChange={(event) => {
                          const next = event.target.value;
                          setIsBackgroundTransparent(false);
                          setPreviousBackgroundColorValue(next);
                          setBackgroundColor(next);
                        }}
                        onKeyDown={(event) => {
                          if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
                            return;
                          }

                          event.preventDefault();

                          const direction = event.key === "ArrowUp" ? 1 : -1;
                          const step = event.shiftKey ? effectiveNudgeAmount : 1;

                          setIsBackgroundTransparent(false);
                          setBackgroundColor((current) => {
                            const lightness = getHexLightness(current, "#ffffff");
                            const nextLightness = lightness + direction * step;
                            const nextColor = setHexLightness(
                              current,
                              "#ffffff",
                              nextLightness,
                            );
                            setPreviousBackgroundColorValue(nextColor);
                            return nextColor;
                          });
                        }}
                        className="h-full w-full flex-1 min-w-0 rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 outline-none ring-0 placeholder:text-zinc-400 focus:border-red-400"
                        placeholder="#ffffff"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (isBackgroundTransparent) {
                            setBackgroundColor(previousBackgroundColorValue);
                            setIsBackgroundTransparent(false);
                          } else {
                            setBackgroundColor("transparent");
                            setIsBackgroundTransparent(true);
                          }
                        }}
                        className={`inline-flex h-full items-center justify-center rounded-full border px-2.5 text-[10px] font-medium transition-colors ${
                          isBackgroundTransparent
                            ? "border-red-300 bg-red-50 text-red-700"
                            : "border-zinc-200 bg-white text-zinc-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                        }`}
                      >
                        Transparent
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-zinc-600">Preview</p>
                {variant === "full" && (
                  <p className="text-[10px] text-zinc-500">
                    Adjust the shape on the left, then copy or download the SVG below.
                  </p>
                )}
              </div>
              {variant === "hero" ? (
                <div className="flex flex-wrap items-center gap-2">
                  <div
                    ref={downloadToggleRef}
                    className="relative inline-flex shrink-0 rounded-full border border-zinc-200 bg-white p-0.5 text-[10px]"
                  >
                    <span
                      className={`absolute inset-y-0 my-0.5 rounded-full bg-red-500 shadow-sm transition-all duration-150 ${
                        downloadPillStyle ? "opacity-100" : "opacity-0"
                      }`}
                      style={
                        downloadPillStyle
                          ? {
                              left: downloadPillStyle.left,
                              width: downloadPillStyle.width,
                            }
                          : undefined
                      }
                    />
                    <button
                      type="button"
                      ref={downloadSvgRef}
                      onClick={() => setDownloadFormat("svg")}
                      className={`relative z-10 rounded-full px-2.5 py-1 transition-colors duration-150 ${
                        downloadFormat === "svg"
                          ? "text-white"
                          : "text-zinc-600 hover:text-zinc-800"
                      }`}
                    >
                      SVG
                    </button>
                    <button
                      type="button"
                      ref={downloadPngRef}
                      onClick={() => setDownloadFormat("png")}
                      className={`relative z-10 rounded-full px-2.5 py-1 transition-colors duration-150 ${
                        downloadFormat === "png"
                          ? "text-white"
                          : "text-zinc-600 hover:text-zinc-800"
                      }`}
                    >
                      PNG
                    </button>
                    <button
                      type="button"
                      ref={downloadJpgRef}
                      onClick={() => setDownloadFormat("jpg")}
                      className={`relative z-10 rounded-full px-2.5 py-1 transition-colors duration-150 ${
                        downloadFormat === "jpg"
                          ? "text-white"
                          : "text-zinc-600 hover:text-zinc-800"
                      }`}
                    >
                      JPG
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownload(downloadFormat)}
                    onMouseEnter={() => {
                      setDownloadIconSrc("/icons/download/download_red.svg");
                    }}
                    onMouseLeave={() => {
                      if (typeof document === "undefined") {
                        setDownloadIconSrc("/icons/download/download-black.svg");
                        return;
                      }

                      const root = document.documentElement;
                      const theme = root.getAttribute("data-theme");
                      setDownloadIconSrc(
                        theme === "dark"
                          ? "/icons/download/download-white.svg"
                          : "/icons/download/download-black.svg",
                      );
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-medium text-zinc-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                  >
                    <Image
                      src={downloadIconSrc}
                      alt=""
                      width={14}
                      height={14}
                      className="h-3.5 w-3.5"
                    />
                    <span>{downloadLabel}</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-medium text-zinc-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                >
                  Copy
                </button>
              )}
            </div>
            <div className="overflow-hidden rounded-2xl border border-dashed border-zinc-200 bg-zinc-50">
              <div
                className={`relative w-full ${
                  variant === "hero" ? "h-52 sm:h-60 md:h-80" : "h-64 sm:h-72 md:h-96"
                }`}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: "url(/images/checkerboard.png)",
                    backgroundSize: "50% 100%",
                    backgroundRepeat: "repeat",
                    backgroundPosition: "0 0",
                    opacity:
                      backgroundColor === "transparent" || fillColor === "transparent" ? 1 : 0,
                    transition: "opacity 150ms ease-out",
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: backgroundColor === "transparent" ? "transparent" : backgroundColor,
                  }}
                />
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  preserveAspectRatio="none"
                  className="absolute inset-0 h-full w-full"
                >
                  <path
                    className="wave-randomize-path"
                    fill={fillColor || "#f97373"}
                    d={currentPath}
                  />
                </svg>
              </div>
            </div>
            {copyNotice && (
              <div
                className="pointer-events-none absolute z-20 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-medium text-white shadow-sm"
                style={{ left: copyNotice.x, top: copyNotice.y }}
              >
                {copyNotice.label}
              </div>
            )}
          </div>
          {variant === "full" && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-medium text-zinc-600">Export</p>
                <div className="flex flex-wrap items-center gap-2">
                  <div
                    ref={downloadToggleRef}
                    className="relative inline-flex shrink-0 rounded-full border border-zinc-200 bg-white p-0.5 text-[10px]"
                  >
                    <span
                      className={`absolute inset-y-0 my-0.5 rounded-full bg-red-500 shadow-sm transition-all duration-150 ${
                        downloadPillStyle ? "opacity-100" : "opacity-0"
                      }`}
                      style={
                        downloadPillStyle
                          ? {
                              left: downloadPillStyle.left,
                              width: downloadPillStyle.width,
                            }
                          : undefined
                      }
                    />
                    <button
                      type="button"
                      ref={downloadSvgRef}
                      onClick={() => setDownloadFormat("svg")}
                      className={`relative z-10 rounded-full px-2.5 py-1 transition-colors duration-150 ${
                        downloadFormat === "svg"
                          ? "text-white"
                          : "text-zinc-600 hover:text-zinc-800"
                      }`}
                    >
                      SVG
                    </button>
                    <button
                      type="button"
                      ref={downloadPngRef}
                      onClick={() => setDownloadFormat("png")}
                      className={`relative z-10 rounded-full px-2.5 py-1 transition-colors duration-150 ${
                        downloadFormat === "png"
                          ? "text-white"
                          : "text-zinc-600 hover:text-zinc-800"
                      }`}
                    >
                      PNG
                    </button>
                    <button
                      type="button"
                      ref={downloadJpgRef}
                      onClick={() => setDownloadFormat("jpg")}
                      className={`relative z-10 rounded-full px-2.5 py-1 transition-colors duration-150 ${
                        downloadFormat === "jpg"
                          ? "text-white"
                          : "text-zinc-600 hover:text-zinc-800"
                      }`}
                    >
                      JPG
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownload(downloadFormat)}
                    onMouseEnter={() => {
                      setDownloadIconSrc("/icons/download/download_red.svg");
                    }}
                    onMouseLeave={() => {
                      if (typeof document === "undefined") {
                        setDownloadIconSrc("/icons/download/download-black.svg");
                        return;
                      }

                      const root = document.documentElement;
                      const theme = root.getAttribute("data-theme");
                      setDownloadIconSrc(
                        theme === "dark"
                          ? "/icons/download/download-white.svg"
                          : "/icons/download/download-black.svg",
                      );
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-medium text-zinc-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                  >
                    <Image
                      src={downloadIconSrc}
                      alt=""
                      width={14}
                      height={14}
                      className="h-3.5 w-3.5"
                    />
                    <span>{downloadLabel}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
