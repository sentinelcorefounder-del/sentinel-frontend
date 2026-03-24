"use client";

import { useEffect, useMemo, useState } from "react";

const API_URL = "https://sentinel-ai1.onrender.com";

type AnalysisResponse = {
  prediction?: string;
  confidence?: number | string;
  severity?: string;
  referable_dr?: boolean;
  heatmap?: string;
  heatmap_url?: string;
  warning?: string;
  error?: string;
  result?: string;
};

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [overlayOpacity, setOverlayOpacity] = useState(55);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const heatmapSrc = useMemo(() => {
    if (!result) return "";
    if (result.heatmap_url) {
      return result.heatmap_url.startsWith("http")
        ? result.heatmap_url
        : `${API_URL}${result.heatmap_url}`;
    }
    if (result.heatmap) return result.heatmap;
    return "";
  }, [result]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setError("");
    setResult(null);

    if (!selected) {
      setFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
      return;
    }

    if (!selected.type.startsWith("image/")) {
      setError("Please upload an image file.");
      setFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setError("Please upload an image smaller than 10MB.");
      setFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a retinal image first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Analysis failed.");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const predictionText = result?.prediction || result?.result || "Unavailable";

  const confidenceText =
    typeof result?.confidence === "number"
      ? `${(result.confidence * 100).toFixed(1)}%`
      : result?.confidence || "Unavailable";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/sentinel-logo.png"
                alt="Sentinel AI logo"
                className="h-10 w-10 rounded-xl object-contain ring-1 ring-slate-200"
              />

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Sentinel AI
                  </h1>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    AI Retinal Screening
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  Clean, research-focused diabetic retinopathy image analysis
                  with prediction insights and heatmap overlay.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex">
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                <p className="text-slate-500">Mode</p>
                <p className="font-medium text-slate-900">Single image</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                <p className="text-slate-500">Heatmap</p>
                <p className="font-medium text-slate-900">
                  {heatmapSrc ? "Available" : "Pending"}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.9fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Image workspace</h2>
                <p className="text-sm text-slate-500">
                  Upload a retinal scan, analyze it, and review the heatmap
                  overlay.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  Choose image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={handleAnalyze}
                  disabled={loading || !file}
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Analyzing..." : "Analyze image"}
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Retinal preview
                  </p>
                  <p className="text-xs text-slate-500">
                    Base image with optional Grad-CAM overlay
                  </p>
                </div>

                {heatmapSrc && (
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Overlay opacity</p>
                    <p className="text-sm font-medium text-slate-800">
                      {overlayOpacity}%
                    </p>
                  </div>
                )}
              </div>

              <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-4">
                {previewUrl ? (
                  <div className="relative flex h-full w-full items-center justify-center">
                    <div className="relative inline-block max-h-[520px] max-w-full">
                      <img
                        src={previewUrl}
                        alt="Retinal preview"
                        className="block max-h-[520px] max-w-full rounded-2xl object-contain shadow-sm"
                      />

                      {heatmapSrc && (
                        <img
                          src={heatmapSrc}
                          alt="Heatmap overlay"
                          className="pointer-events-none absolute inset-0 h-full w-full rounded-2xl object-contain"
                          style={{ opacity: overlayOpacity / 100 }}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-700">
                      No image selected
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Upload a retinal image to begin analysis.
                    </p>
                  </div>
                )}
              </div>

              {heatmapSrc && (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <label
                      htmlFor="overlayOpacity"
                      className="text-sm font-medium text-slate-700"
                    >
                      Adjust heatmap transparency
                    </label>
                    <span className="text-xs text-slate-500">
                      0% = image only, 100% = full heatmap
                    </span>
                  </div>

                  <input
                    id="overlayOpacity"
                    type="range"
                    min="0"
                    max="100"
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                    className="w-full accent-slate-900"
                  />
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold">Analysis results</h2>
                <p className="text-sm text-slate-500">
                  Model output and summary insights.
                </p>
              </div>

              {!result && !loading && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  Results will appear here after analysis.
                </div>
              )}

              {loading && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-8 text-center text-sm text-blue-700">
                  Processing image and generating heatmap...
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Prediction
                      </p>
                      <p className="mt-1 text-base font-semibold text-slate-900">
                        {predictionText}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Confidence
                      </p>
                      <p className="mt-1 text-base font-semibold text-slate-900">
                        {confidenceText}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Severity
                      </p>
                      <p className="mt-1 text-base font-semibold text-slate-900">
                        {result.severity || "Unavailable"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Referable DR
                      </p>
                      <p className="mt-1 text-base font-semibold text-slate-900">
                        {result.referable_dr === undefined
                          ? "Unavailable"
                          : result.referable_dr
                          ? "Yes"
                          : "No"}
                      </p>
                    </div>
                  </div>

                  {result.warning && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      {result.warning}
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-base font-semibold">Clinical disclaimer</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This application is for research and decision-support purposes
                only. It does not replace diagnosis or clinical judgement by a
                qualified eye care professional.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}