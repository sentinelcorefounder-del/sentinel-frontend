"use client";

import { useMemo, useState } from "react";

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
      setPreviewUrl("");
      return;
    }

    if (!selected.type.startsWith("image/")) {
      setError("Please upload an image file.");
      setFile(null);
      setPreviewUrl("");
      return;
    }

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

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <img
              src="/sentinel-logo.png"
              alt="Sentinel AI logo"
              className="h-10 w-auto"
            />
          </div>

          <h1 className="text-4xl font-bold text-gray-900">Sentinel AI</h1>
          <p className="mt-3 text-lg text-gray-600">
            Retinal image screening for diabetic retinopathy with AI-assisted
            analysis.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Upload retinal image
            </h2>

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mb-4 block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-700"
            />

            <button
              onClick={handleAnalyze}
              disabled={loading || !file}
              className="w-full rounded-lg bg-black px-4 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Analyze image"}
            </button>

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6">
              <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
                Preview
              </h3>
              <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Retinal preview"
                    className="max-h-[340px] rounded-xl object-contain"
                  />
                ) : (
                  <p className="text-sm text-gray-500">No image selected yet.</p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Analysis result
            </h2>

            {!result && !loading && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500">
                Upload an image and click Analyze to see the model output.
              </div>
            )}

            {loading && (
              <div className="rounded-2xl bg-blue-50 p-6 text-sm text-blue-700">
                Processing image and generating prediction...
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Prediction
                    </p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {result.prediction || result.result || "Unavailable"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Confidence
                    </p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {typeof result.confidence === "number"
                        ? `${(result.confidence * 100).toFixed(1)}%`
                        : result.confidence || "Unavailable"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Severity
                    </p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {result.severity || "Unavailable"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Referable DR
                    </p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {result.referable_dr === undefined
                        ? "Unavailable"
                        : result.referable_dr
                        ? "Yes"
                        : "No"}
                    </p>
                  </div>
                </div>

                {result.warning && (
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                    {result.warning}
                  </div>
                )}

                {heatmapSrc && (
                  <div>
                    <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
                      Grad-CAM heatmap
                    </h3>
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <img
                        src={heatmapSrc}
                        alt="Grad-CAM heatmap"
                        className="max-h-[360px] w-full rounded-xl object-contain"
                      />
                    </div>
                  </div>
                )}

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
                  Clinical disclaimer: This tool is for research and decision
                  support only.
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}