"use client";

import { useState } from "react";

// ✅ SINGLE SOURCE OF TRUTH
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
      console.log("API RESPONSE:", data);

      setResult(data);
    } catch (error) {
      console.error("ERROR:", error);
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8 bg-white p-4 rounded shadow">
          <img
            src="/sentinel-logo.png"
            alt="Sentinel Logo"
            className="h-20 object-contain"
          />

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Sentinel
            </h1>
            <p className="text-sm text-gray-500">
              Diabetic Retinopathy Screening
            </p>
          </div>
        </div>

        {/* Upload */}
        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-md mb-6">
          <p className="text-gray-700 font-medium mb-2">
            Upload retinal fundus image
          </p>

          <div className="flex items-center gap-4">
            <input type="file" onChange={handleUpload} />

            <button
              onClick={analyzeImage}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Analyze
            </button>
          </div>

          {/* 🔥 LOADING STATE */}
          {loading && (
            <p className="mt-4 text-blue-600">
              ⏳ Analyzing image... (server may take a few seconds to wake up)
            </p>
          )}
        </div>

        {/* ⚠️ WARNINGS */}
        {result?.prediction === "Invalid image" && (
          <div className="bg-yellow-100 p-4 rounded mb-6 text-yellow-800">
            ⚠️ This is not a retinal fundus image
          </div>
        )}

        {result?.prediction === "Uncertain image" && (
          <div className="bg-orange-100 p-4 rounded mb-6 text-orange-800">
            ⚠️ Image unclear — please upload a better quality retinal image
          </div>
        )}

        {/* IMAGE VIEW */}
        {(preview || result) && (
          <div className="bg-white p-6 rounded shadow mb-6">

            <h2 className="font-semibold mb-4 text-center">
              AI Analysis
            </h2>

            <div className="relative w-[350px] h-[350px] mx-auto bg-black rounded overflow-hidden flex items-center justify-center">

              {/* Base Image */}
              <img
                src={
                  result?.processed_image_url
                    ? API_URL + result.processed_image_url
                    : preview || ""
                }
                className="absolute inset-0 w-full h-full object-contain"
              />

              {/* Heatmap */}
              {result?.heatmap_url && (
                <img
                  src={`${API_URL}${result.heatmap_url}?t=${Date.now()}`}
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ opacity }}
                />
              )}

            </div>

            {/* Slider */}
            {result?.heatmap_url && (
              <div className="mt-4">
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

          </div>
        )}

        {/* RESULTS */}
        {result &&
          result.prediction !== "Invalid image" &&
          result.prediction !== "Uncertain image" && (
            <div className="mt-8">

              <div
                className={`p-6 rounded shadow text-white ${
                  result.prediction === "Referable DR"
                    ? "bg-red-600"
                    : "bg-green-600"
                }`}
              >
                <h2 className="text-2xl font-bold">
                  {result.prediction}
                </h2>

                <p className="mt-2 text-lg">
                  {result.prediction === "Referable DR"
                    ? "Referral recommended"
                    : "Routine monitoring"}
                </p>
              </div>

              {/* Safety Warning */}
              {result.prediction === "No Referable DR" && (
                <p className="mt-2 text-xs text-red-500">
                  ⚠️ Absence of referable DR does not rule out other eye conditions.
                </p>
              )}

              {/* Confidence */}
              <div className="mt-4 bg-white p-4 rounded shadow">
                <p className="font-semibold">Confidence</p>

                <div className="w-full bg-gray-200 rounded h-4 mt-2">
                  <div
                    className="bg-blue-600 h-4 rounded"
                    style={{ width: `${result.confidence * 100}%` }}
                  ></div>
                </div>

                <p className="mt-2 text-sm text-gray-600">
                  {(result.confidence * 100).toFixed(1)}%
                </p>
              </div>

              {/* Severity */}
              <div className="mt-4 bg-white p-4 rounded shadow">
                <p className="font-semibold">Severity</p>
                <p className="text-lg text-gray-700 mt-1">
                  {result.severity_label}
                </p>
              </div>

              {/* Disclaimer */}
              <p className="mt-6 text-sm text-gray-600 bg-gray-100 p-4 rounded border">
                {result.disclaimer}
              </p>

            </div>
          )}

      </div>
    </main>
  );
}