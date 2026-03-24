"use client";

import { useState } from "react";

const API_URL = "https://sentinel-ai1.onrender.com";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [opacity, setOpacity] = useState(0.5);
  const [loading, setLoading] = useState(false);

  const handleUpload = (e: any) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const analyzeImage = async () => {
    if (!image) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="w-full max-w-4xl space-y-6">

        {/* HEADER */}
        <div className="flex items-center gap-4 bg-white p-4 rounded shadow">
          <img
            src="/sentinel-logo.png"
            className="h-12 w-auto object-contain"
          />
          <div>
            <h1 className="text-xl font-bold">Sentinel</h1>
            <p className="text-sm text-gray-500">
              Diabetic Retinopathy Screening
            </p>
          </div>
        </div>

        {/* UPLOAD */}
        <div className="bg-white p-4 rounded shadow flex gap-4 items-center">
          <input type="file" onChange={handleUpload} />
          <button
            onClick={analyzeImage}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Analyze
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center text-gray-600">
            ⏳ Analyzing... (first run may take time)
          </div>
        )}

        {/* IMAGE + HEATMAP */}
        {(preview || result) && (
          <div className="bg-white p-6 rounded shadow flex justify-center">

            <div className="relative w-[350px] h-[350px] bg-black rounded overflow-hidden">

              {/* BASE IMAGE */}
              <img
                src={
                  result?.processed_image_url
                    ? API_URL + result.processed_image_url
                    : preview || ""
                }
                className="absolute inset-0 w-full h-full object-contain"
              />

              {/* HEATMAP */}
              {result?.heatmap_url && (
                <img
                  src={`${API_URL}${result.heatmap_url}?t=${Date.now()}`}
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ opacity }}
                />
              )}

            </div>
          </div>
        )}

        {/* SLIDER */}
        {result?.heatmap_url && (
          <div className="bg-white p-4 rounded shadow">
            <label className="text-sm text-gray-600">
              Heatmap Opacity: {(opacity * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full mt-2"
            />
          </div>
        )}

        {/* RESULTS */}
        {result && (
          <div className="space-y-4">

            <div
              className={`p-4 rounded text-white ${
                result.prediction === "Referable DR"
                  ? "bg-red-600"
                  : "bg-green-600"
              }`}
            >
              <h2 className="text-xl font-bold">{result.prediction}</h2>
            </div>

            {result.prediction === "No Referable DR" && (
              <p className="text-xs text-red-500">
                ⚠️ Absence of referable DR does not rule out other conditions.
              </p>
            )}

            <div className="bg-white p-4 rounded shadow">
              <p className="font-semibold">Confidence</p>
              <div className="w-full bg-gray-200 h-4 rounded mt-2">
                <div
                  className="bg-blue-600 h-4 rounded"
                  style={{ width: `${result.confidence * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <p className="font-semibold">Severity</p>
              <p>{result.severity_label}</p>
            </div>

            <p className="text-sm text-gray-500 bg-gray-100 p-4 rounded">
              {result.disclaimer}
            </p>
          </div>
        )}

      </div>
    </main>
  );
}
