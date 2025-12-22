"use client";

import { useEffect, useMemo, useState } from "react";

type LengthMode = "words" | "sentences" | "paragraphs";

type CasingMode = "sentence" | "lower" | "upper" | "title";

type ListStyle = "none" | "numbered" | "bulleted";

const baseLorem = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec mattis vitae lectus non auctor. Nunc eget nulla nec turpis auctor rutrum. Aliquam sit amet ante et mauris egestas venenatis vitae sed tellus. Donec vestibulum leo tortor, rutrum blandit velit elementum ac. Sed faucibus congue suscipit. Aliquam egestas lacus in metus mattis, vitae convallis arcu luctus. Etiam non ultricies arcu. Mauris sit amet dapibus elit, sed auctor orci. Curabitur eu posuere ante. Quisque in consectetur velit, semper faucibus nulla. Proin rhoncus nulla at gravida suscipit. Donec vel enim non lorem tempor iaculis ac id magna. Vivamus efficitur massa felis, ut facilisis diam mollis vel. Maecenas a metus congue, gravida libero non, luctus nibh. Vestibulum fringilla, lacus in gravida luctus, tellus ex malesuada sapien, ut pharetra tellus mauris quis magna.

In mauris odio, blandit sed purus vitae, placerat dictum ante. Donec arcu lacus, condimentum eu sapien eu, pharetra vestibulum leo. Vivamus ipsum dui, hendrerit feugiat tincidunt vitae, bibendum id metus. Integer sed mattis sapien, at fermentum nisi. Donec ut aliquet risus, finibus mattis arcu. Phasellus eu ex vestibulum, laoreet tellus in, porttitor nisi. Cras ante turpis, varius non metus vitae, accumsan volutpat dolor. Integer sed ultricies orci. Sed mattis risus faucibus consectetur ultricies. Maecenas tincidunt nec nunc sed fringilla. Proin aliquet nisi at magna fringilla, vel semper orci ultricies. Praesent id dolor tempor, consectetur purus a, tincidunt dolor. Nam nec sem molestie, convallis lorem non, eleifend quam. Praesent vel fermentum nulla.

Phasellus eu neque felis. Nullam vel feugiat dui. Donec vehicula turpis eu orci congue consectetur. Maecenas accumsan ante ut lobortis vehicula. Nulla tempus, libero eu congue efficitur, sem enim bibendum nulla, eu tempor enim tortor a nulla. In sit amet ultricies diam. Praesent sodales ut nulla ut egestas. Duis mollis diam at quam luctus, convallis dapibus justo accumsan. Vestibulum non nibh molestie, venenatis nibh quis, ultricies nulla. Vestibulum velit nunc, blandit eu nunc id, bibendum finibus purus. Sed interdum erat nec rhoncus facilisis.

Proin vel mi ornare, dapibus mauris eu, imperdiet lectus. Fusce eget iaculis nunc. Cras commodo arcu massa, eget venenatis sem cursus ac. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam tincidunt nec nisi quis elementum. Cras elementum interdum odio, in lobortis tortor tincidunt sed. Nullam non nisi tristique erat facilisis mattis. Pellentesque ut luctus elit, vitae faucibus mi.

Phasellus fringilla eros ac nisl venenatis commodo. Sed mollis ex vel enim cursus auctor. Maecenas pretium dolor a sapien aliquet sollicitudin. Maecenas non felis sed nisl convallis hendrerit vitae id augue. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam at lorem interdum, ultricies turpis in, aliquam mi. Praesent lobortis auctor augue, ac tristique risus lobortis sed. Aenean ut velit rhoncus, cursus lorem et, convallis ligula. Fusce sit amet ligula porta, auctor ex a, imperdiet nunc. Mauris molestie nulla ante, eu condimentum neque iaculis sit amet.`;

const baseLoremWords = baseLorem.split(" ").filter((word) => word.trim().length > 0);

const baseLoremSentences = baseLorem
  .split(/(?<=[.!?])\s+/)
  .map((sentence) => sentence.trim())
  .filter((sentence) => sentence.length > 0);

function buildWords(count: number) {
  if (count <= 0) {
    return [];
  }

  const words: string[] = [];

  for (let index = 0; index < count; index += 1) {
    const word = baseLoremWords[index % baseLoremWords.length] ?? baseLoremWords[0] ?? "";

    words.push(word);
  }

  return words;
}

function buildSentences(count: number) {
  if (count <= 0) {
    return [];
  }

  if (baseLoremSentences.length === 0) {
    return [];
  }

  const sentences: string[] = [];

  for (let index = 0; index < count; index += 1) {
    const sentence =
      baseLoremSentences[index % baseLoremSentences.length] ?? baseLoremSentences[0] ?? "";

    sentences.push(sentence);
  }

  return sentences;
}

function toSentenceCase(text: string) {
  const trimmed = text.trim();

  if (!trimmed) {
    return "";
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

function toTitleCase(text: string) {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => {
      if (!word) {
        return word;
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function applyCasing(text: string, words: string[], mode: CasingMode) {
  if (mode === "lower") {
    return text.toLowerCase();
  }

  if (mode === "upper") {
    return text.toUpperCase();
  }

  if (mode === "title") {
    return toTitleCase(text);
  }

  return toSentenceCase(text);
}

type LoremPlaceholderGeneratorProps = {
  variant?: "default" | "hero";
};

export function LoremPlaceholderGenerator({ variant = "default" }: LoremPlaceholderGeneratorProps) {
  const [lengthMode, setLengthMode] = useState<LengthMode>("words");
  const [casingMode, setCasingMode] = useState<CasingMode>("sentence");
  const [lengthInput, setLengthInput] = useState("8");
  const [isCopied, setIsCopied] = useState(false);
  const [listStyle, setListStyle] = useState<ListStyle>("none");

  useEffect(() => {
    if (!isCopied) {
      return;
    }

    const id = window.setTimeout(() => {
      setIsCopied(false);
    }, 1600);

    return () => {
      window.clearTimeout(id);
    };
  }, [isCopied]);

  const lengthValue = useMemo(() => {
    const parsed = Number.parseInt(lengthInput.trim(), 10);

    const min =
      lengthMode === "words"
        ? 8
        : 1;

    const max =
      lengthMode === "words"
        ? 100
        : lengthMode === "sentences"
          ? 50
          : 20;

    const defaultValue =
      lengthMode === "words"
        ? 8
        : 1;

    if (!Number.isFinite(parsed)) {
      return defaultValue;
    }

    if (parsed < min) {
      return min;
    }

    if (parsed > max) {
      return max;
    }

    return parsed;
  }, [lengthInput, lengthMode]);

  const output = useMemo(() => {
    if (lengthMode === "paragraphs") {
      const wordsPerParagraph = 60;
      const paragraphs: string[] = [];

      for (let index = 0; index < lengthValue; index += 1) {
        const words = buildWords(wordsPerParagraph);
        const text = words.join(" ");
        const cased = applyCasing(text, words, casingMode);

        paragraphs.push(cased);
      }

      return paragraphs.join("\n\n");
    }

    if (lengthMode === "sentences") {
      const sentences = buildSentences(lengthValue);
      const text = sentences.join(" ");
      const words = text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0);

      return applyCasing(text, words, casingMode);
    }

    const words = buildWords(lengthValue);
    const text = words.join(" ");

    return applyCasing(text, words, casingMode);
  }, [lengthMode, lengthValue, casingMode]);

  const styledOutput = useMemo(() => {
    if (listStyle === "none") {
      return output;
    }

    if (lengthMode === "paragraphs") {
      const paragraphs = output.split(/\n{2,}/);

      const prefixed = paragraphs
        .map((paragraph, index) => {
          const trimmed = paragraph.trim();

          if (!trimmed) {
            return "";
          }

          const content =
            casingMode === "sentence" ? toSentenceCase(trimmed) : trimmed;

          if (listStyle === "numbered") {
            return `${index + 1}. ${content}`;
          }

          return `• ${content}`;
        })
        .filter((paragraph) => paragraph.length > 0);

      return prefixed.join("\n");
    }

    if (lengthMode === "sentences") {
      const sentences = output
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => sentence.trim())
        .filter((sentence) => sentence.length > 0);

      if (sentences.length === 0) {
        return output;
      }

      const prefixed = sentences.map((sentence, index) => {
        const content =
          casingMode === "sentence" ? toSentenceCase(sentence) : sentence;

        if (listStyle === "numbered") {
          return `${index + 1}. ${content}`;
        }

        return `• ${content}`;
      });

      return prefixed.join("\n");
    }

    const words = output
      .split(/\s+/)
      .map((word) => word.trim())
      .filter((word) => word.length > 0);

    if (words.length === 0) {
      return output;
    }

    const prefixed = words.map((word, index) => {
      const content =
        casingMode === "sentence" ? toSentenceCase(word) : word;

      if (listStyle === "numbered") {
        return `${index + 1}. ${content}`;
      }

      return `• ${content}`;
    });

    return prefixed.join("\n");
  }, [output, listStyle, lengthMode, casingMode]);

  const [ensurePeriod, setEnsurePeriod] = useState(false);

  type PresetMode = "none" | "quote" | "definition" | "title-with-list";

  const [presetMode, setPresetMode] = useState<PresetMode>("none");

  const finalOutput = useMemo(() => {
    if (!ensurePeriod) {
      return styledOutput;
    }

    const trimmed = styledOutput.trimEnd();

    if (!trimmed) {
      return styledOutput;
    }

    const last = trimmed.charAt(trimmed.length - 1);

    if (last === "." || last === "!" || last === "?") {
      return trimmed;
    }

    return `${trimmed}.`;
  }, [styledOutput, ensurePeriod]);

  const presetOutput = useMemo(() => {
    const base = finalOutput.trim();

    if (!base) {
      return finalOutput;
    }

    if (presetMode === "quote") {
      return `“${base}”`;
    }

    if (presetMode === "definition") {
      const [firstLine, ...rest] = base.split(/\n+/);
      const rawTitle = firstLine.trim();

      if (!rawTitle) {
        return finalOutput;
      }

      const titleWords = rawTitle
        .split(/\s+/)
        .filter((word) => word.length > 0)
        .slice(0, 5);

      const titleText = titleWords.join(" ");
      const title = applyCasing(titleText, titleWords, casingMode);
      const body = rest.join("\n").trim() || base;

      return `${title} - ${body}`;
    }

    if (presetMode === "title-with-list") {
      const lines = base
        .split(/\n+/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (lines.length === 0) {
        return finalOutput;
      }

      const [first, ...rest] = lines;
      const titleWords = first
        .split(/\s+/)
        .filter((word) => word.length > 0);
      const titleText = titleWords.join(" ");
      const title = applyCasing(titleText, titleWords, casingMode);

      const cleanItems =
        rest.length > 0
          ? rest
          : base
              .split(/(?<=[.!?])\s+/)
              .map((sentence) => sentence.trim())
              .filter((sentence) => sentence.length > 0);

      if (cleanItems.length === 0) {
        return title;
      }

      const formatted = cleanItems.map((item, index) => {
        const stripped = item.replace(/^•\s+/, "").replace(/^\d+\.\s+/, "");

        if (listStyle === "numbered") {
          return `${index + 1}. ${stripped}`;
        }

        return `• ${stripped}`;
      });

      return [title, ...formatted].join("\n");
    }

    return finalOutput;
  }, [finalOutput, presetMode, listStyle, casingMode]);

  const totalCharacters = presetOutput.length;
  const totalWords = presetOutput
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  async function handleCopyClick() {
    if (presetOutput.trim().length === 0) {
      return;
    }

    if (typeof navigator === "undefined" || typeof navigator.clipboard === "undefined") {
      return;
    }

    try {
      await navigator.clipboard.writeText(presetOutput);
      setIsCopied(true);
    } catch {
    }
  }

  const lengthLabel =
    lengthMode === "words"
      ? "Number of words"
      : lengthMode === "sentences"
        ? "Number of sentences"
        : "Number of paragraphs";

  const helperText =
    lengthMode === "words"
      ? ""
      : "Each paragraph uses a balanced block of lorem ipsum text.";

  const previewHeightClass = "h-[260px] sm:h-[320px]";
  const containerClass = "flex flex-col gap-4 py-6 sm:flex-row sm:items-start";
  const previewWrapperClass = "flex-1";

  if (variant === "hero") {
    const heroPreviewHeightClass = "h-[140px] sm:h-[160px]";

    return (
      <div className="space-y-3 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] text-zinc-600">
          <div className="space-y-0.5">
            <p className="font-medium text-zinc-700">Placeholder summary</p>
            <p className="text-[10px] text-zinc-500">
              {totalWords.toLocaleString("en-US")} words ·{" "}
              {totalCharacters.toLocaleString("en-US")} characters
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEnsurePeriod((current) => !current)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-medium ${
                ensurePeriod
                  ? "border-red-500 bg-red-500 text-white shadow-sm"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-red-200 hover:text-red-600"
              }`}
            >
              <span>End with dot</span>
            </button>
            <button
              type="button"
              onClick={handleCopyClick}
              className="inline-flex items-center gap-1 rounded-full bg-red-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-red-600 active:scale-95"
            >
              <span>{isCopied ? "Copied" : "Copy text"}</span>
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-zinc-900">Generated placeholder</p>
              <p className="text-[11px] text-zinc-500">
                Use this block anywhere you need temporary copy while designing interfaces.
              </p>
            </div>
          </div>
          <div className="mb-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-zinc-700">Format</span>
              <div className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 p-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setLengthMode("words");
                    setLengthInput("8");
                  }}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    lengthMode === "words"
                      ? "bg-red-500 text-white shadow-sm"
                      : "text-zinc-600 hover:text-red-600"
                  }`}
                >
                  Words
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLengthMode("sentences");
                    setLengthInput("1");
                  }}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    lengthMode === "sentences"
                      ? "bg-red-500 text-white shadow-sm"
                      : "text-zinc-600 hover:text-red-600"
                  }`}
                >
                  Sentences
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLengthMode("paragraphs");
                    setLengthInput("1");
                  }}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    lengthMode === "paragraphs"
                      ? "bg-red-500 text-white shadow-sm"
                      : "text-zinc-600 hover:text-red-600"
                  }`}
                >
                  Paragraphs
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500">Length</span>
              <input
                type="range"
                min={lengthMode === "words" ? 8 : 1}
                max={
                  lengthMode === "words"
                    ? 100
                    : lengthMode === "sentences"
                      ? 50
                      : 20
                }
                value={Math.min(
                  Math.max(
                    lengthValue,
                    lengthMode === "words" ? 8 : 1,
                  ),
                  lengthMode === "words"
                    ? 100
                    : lengthMode === "sentences"
                      ? 50
                      : 20,
                )}
                onChange={(event) => {
                  const next = Number.parseInt(event.target.value, 10);

                  if (!Number.isFinite(next)) {
                    return;
                  }

                  setLengthInput(String(next));
                }}
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-zinc-200"
              />
              <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
                {lengthValue.toLocaleString("en-US")}
              </span>
            </div>
          </div>
          <div
            className={`rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-[13px] leading-relaxed text-zinc-800 ${heroPreviewHeightClass}`}
          >
            <div className="h-full overflow-auto whitespace-pre-wrap break-words">
              {presetOutput}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className="w-full max-w-sm space-y-4">
        <div className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-zinc-900">Length</p>
          <label className="space-y-1 text-[11px] text-zinc-600">
            <span className="flex items-center justify-between">
              <span>{lengthLabel}</span>
            </span>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="range"
                min={lengthMode === "words" ? 8 : 1}
                max={
                  lengthMode === "words"
                    ? 100
                    : lengthMode === "sentences"
                      ? 50
                      : 20
                }
                value={Math.min(
                  Math.max(
                    lengthValue,
                    lengthMode === "words" ? 8 : 1,
                  ),
                  lengthMode === "words"
                    ? 100
                    : lengthMode === "sentences"
                      ? 50
                      : 20,
                )}
                onChange={(event) => {
                  const next = Number.parseInt(event.target.value, 10);

                  if (!Number.isFinite(next)) {
                    return;
                  }

                  setLengthInput(String(next));
                }}
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-zinc-200"
              />
              <input
                type="number"
                min={lengthMode === "words" ? 8 : 1}
                max={
                  lengthMode === "words"
                    ? 100
                    : lengthMode === "sentences"
                      ? 50
                      : 20
                }
                value={lengthInput}
                onChange={(event) => setLengthInput(event.target.value)}
                className="w-16 appearance-none rounded-md border border-zinc-200 bg-white px-2 py-1 text-center text-[11px] text-zinc-700 outline-none ring-0 focus:border-red-400"
              />
            </div>
            {helperText && (
              <span className="block pt-1 text-[10px] text-zinc-500">
                {helperText}
              </span>
            )}
          </label>
        </div>
        <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-zinc-900">Format</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => {
                setLengthMode("words");
                setLengthInput("8");
              }}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                lengthMode === "words"
                  ? "border-red-500 bg-red-500 text-white shadow-sm"
                  : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-red-200 hover:text-red-600"
              }`}
            >
              Words
            </button>
            <button
              type="button"
              onClick={() => {
                setLengthMode("sentences");
                setLengthInput("1");
              }}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                lengthMode === "sentences"
                  ? "border-red-500 bg-red-500 text-white shadow-sm"
                  : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-red-200 hover:text-red-600"
              }`}
            >
              Sentences
            </button>
            <button
              type="button"
              onClick={() => {
                setLengthMode("paragraphs");
                setLengthInput("1");
              }}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                lengthMode === "paragraphs"
                  ? "border-red-500 bg-red-500 text-white shadow-sm"
                  : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-red-200 hover:text-red-600"
              }`}
            >
              Paragraphs
            </button>
          </div>
          <div className="pt-2 space-y-1">
            <p className="text-[11px] font-medium text-zinc-700">Casing</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setCasingMode("sentence")}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                  casingMode === "sentence"
                    ? "border-red-500 bg-red-500 text-white shadow-sm"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-red-200 hover:text-red-600"
                }`}
              >
                Capitalized sentence
              </button>
              <button
                type="button"
                onClick={() => setCasingMode("lower")}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                  casingMode === "lower"
                    ? "border-red-500 bg-red-500 text-white shadow-sm"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-red-200 hover:text-red-600"
                }`}
              >
                Small letters
              </button>
              <button
                type="button"
                onClick={() => setCasingMode("upper")}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                  casingMode === "upper"
                    ? "border-red-500 bg-red-500 text-white shadow-sm"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-red-200 hover:text-red-600"
                }`}
              >
                ALL CAPS
              </button>
              <button
                type="button"
                onClick={() => setCasingMode("title")}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                  casingMode === "title"
                    ? "border-red-500 bg-red-500 text-white shadow-sm"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-red-200 hover:text-red-600"
                }`}
              >
                Title Case
              </button>
            </div>
          </div>
          <div className="pt-2 space-y-1">
            <p className="text-[11px] font-medium text-zinc-700">List style</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setListStyle("none")}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                  listStyle === "none"
                    ? "border-red-500 bg-red-500 text-white shadow-sm"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-red-200 hover:text-red-600"
                }`}
              >
                None
              </button>
              <button
                type="button"
                onClick={() => setListStyle("numbered")}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                  listStyle === "numbered"
                    ? "border-red-500 bg-red-500 text-white shadow-sm"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-red-200 hover:text-red-600"
                }`}
              >
                Numbers
              </button>
              <button
                type="button"
                onClick={() => setListStyle("bulleted")}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                  listStyle === "bulleted"
                    ? "border-red-500 bg-red-500 text-white shadow-sm"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-red-200 hover:text-red-600"
                }`}
              >
                Dots
              </button>
            </div>
          </div>
          <div className="pt-2 space-y-1">
            <p className="text-[11px] font-medium text-zinc-700">Presets</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setPresetMode("none")}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                  presetMode === "none"
                    ? "border-red-500 bg-red-500 text-white shadow-sm"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-red-200 hover:text-red-600"
                }`}
              >
                None
              </button>
              <button
                type="button"
                onClick={() => setPresetMode("quote")}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                  presetMode === "quote"
                    ? "border-red-500 bg-red-500 text-white shadow-sm"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-red-200 hover:text-red-600"
                }`}
              >
                Quote
              </button>
              <button
                type="button"
                onClick={() => setPresetMode("definition")}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                  presetMode === "definition"
                    ? "border-red-500 bg-red-500 text-white shadow-sm"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-red-200 hover:text-red-600"
                }`}
              >
                Definition
              </button>
              <button
                type="button"
                onClick={() => setPresetMode("title-with-list")}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                  presetMode === "title-with-list"
                    ? "border-red-500 bg-red-500 text-white shadow-sm"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-red-200 hover:text-red-600"
                }`}
              >
                Title + list
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-3 text-[11px] text-zinc-600">
          <div className="space-y-0.5">
            <p className="font-medium text-zinc-700">Placeholder summary</p>
            <p className="text-[10px] text-zinc-500">
              {totalWords.toLocaleString("en-US")} words ·{" "}
              {totalCharacters.toLocaleString("en-US")} characters
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEnsurePeriod((current) => !current)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-medium ${
                ensurePeriod
                  ? "border-red-500 bg-red-500 text-white shadow-sm"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-red-200 hover:text-red-600"
              }`}
            >
              <span>End with dot</span>
            </button>
            <button
              type="button"
              onClick={handleCopyClick}
              className="inline-flex items-center gap-1 rounded-full bg-red-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-red-600 active:scale-95"
            >
              <span>{isCopied ? "Copied" : "Copy text"}</span>
            </button>
          </div>
        </div>
      </div>
      <div className={previewWrapperClass}>
        <div className="h-full rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-zinc-900">Generated placeholder</p>
              <p className="text-[11px] text-zinc-500">
                Use this block anywhere you need temporary copy while designing interfaces.
              </p>
            </div>
          </div>
          <div
            className={`rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-[13px] leading-relaxed text-zinc-800 ${previewHeightClass}`}
          >
            <div className="h-full overflow-auto whitespace-pre-wrap break-words">
              {presetOutput}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
