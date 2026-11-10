"use client";

import { useState, useRef } from "react";
import { FiDownload, FiFilm, FiLoader } from "react-icons/fi";

export default function SeamlessVideoPlayer({
  url,
  urls = [],
  className = "w-full h-full object-cover",
  autoPlay = true,
  controls = true,
  muted = false,
  showSceneBar = true,
  showDownloadButton = false,
  overlays = null,
  title = "ugcore-video",
}) {
  const validUrls =
    Array.isArray(urls) && urls.length > 0
      ? urls.filter(Boolean)
      : url
        ? [url]
        : [];

  const [rawIndex, setRawIndex] = useState(0);
  const [isMerging, setIsMerging] = useState(false);
  const videoRef = useRef(null);

  const currentIndex = validUrls.length > 0 ? rawIndex % validUrls.length : 0;

  if (!validUrls.length) return null;

  const isMultiScene = validUrls.length > 1;
  const activeUrl = validUrls[currentIndex] || validUrls[0];

  const handleEnded = () => {
    if (!isMultiScene) return;
    const nextIdx = (currentIndex + 1) % validUrls.length;
    setRawIndex(nextIdx);
  };

  const handleSceneSelect = (idx) => {
    setRawIndex(idx);
  };

  const drawOverlaysOnCanvas = (ctx, width, height) => {
    if (!overlays) return;

    if (overlays.ctaBadge) {
      ctx.save();
      ctx.fillStyle = "rgba(16, 185, 129, 0.92)";
      ctx.fillRect(24, 90, Math.min(width - 48, 320), 42);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText(overlays.ctaBadge, 38, 118);
      ctx.restore();
    }

    if (overlays.subtitle) {
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
      const boxHeight = 64;
      const yPos = height - 220;
      ctx.fillRect(32, yPos, width - 64, boxHeight);
      ctx.fillStyle = "#facc15";
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(overlays.subtitle.slice(0, 48), width / 2, yPos + 40);
      ctx.restore();
    }

    if (overlays.lowerThird) {
      ctx.save();
      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      const yPos = height - 140;
      ctx.fillRect(24, yPos, Math.min(width - 48, 380), 48);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText(overlays.lowerThird, 38, yPos + 30);
      ctx.restore();
    }
  };

  const handleDownloadFullVideo = async (e) => {
    if (e) e.stopPropagation();
    if (!isMultiScene && !overlays?.subtitle && !overlays?.lowerThird && !overlays?.ctaBadge) {
      window.open(validUrls[0], "_blank", "noopener,noreferrer");
      return;
    }

    setIsMerging(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const tempVideo = document.createElement("video");
      tempVideo.crossOrigin = "anonymous";
      tempVideo.playsInline = true;

      await new Promise((resolve, reject) => {
        tempVideo.onloadedmetadata = resolve;
        tempVideo.onerror = reject;
        tempVideo.src = validUrls[0];
      });

      canvas.width = tempVideo.videoWidth || 720;
      canvas.height = tempVideo.videoHeight || 1280;

      const stream = canvas.captureStream(30);
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunks.push(ev.data);
      };

      const recordingFinished = new Promise((resolve) => {
        recorder.onstop = resolve;
      });

      recorder.start();

      for (const clipUrl of validUrls) {
        await new Promise((resolve, reject) => {
          tempVideo.src = clipUrl;
          tempVideo.onloadeddata = () => {
            tempVideo.play().catch(reject);
          };
          tempVideo.onerror = reject;

          const drawFrame = () => {
            if (!tempVideo.paused && !tempVideo.ended) {
              try {
                ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
                drawOverlaysOnCanvas(ctx, canvas.width, canvas.height);
              } catch (drawErr) {
                reject(drawErr);
                return;
              }
              requestAnimationFrame(drawFrame);
            }
          };

          tempVideo.onplay = () => {
            requestAnimationFrame(drawFrame);
          };

          tempVideo.onended = () => {
            resolve();
          };
        });
      }

      recorder.stop();
      await recordingFinished;

      const blob = new Blob(chunks, { type: mimeType });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${title}-completo.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch {
      validUrls.forEach((clipUrl, idx) => {
        const a = document.createElement("a");
        a.href = clipUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.download = `${title}-escena-${idx + 1}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        key={activeUrl}
        src={activeUrl}
        className={className}
        autoPlay={autoPlay}
        loop={!isMultiScene}
        muted={muted}
        playsInline
        controls={controls}
        onEnded={handleEnded}
      />

      {/* Module 3: Multilayer Graphic Overlays */}
      {overlays?.ctaBadge && (
        <div className="absolute top-14 left-3 z-20 px-3 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-black uppercase tracking-wider shadow-lg pointer-events-none">
          {overlays.ctaBadge}
        </div>
      )}

      {overlays?.subtitle && (
        <div className="absolute bottom-24 left-4 right-4 z-20 flex justify-center pointer-events-none">
          <span className="px-3 py-1.5 rounded bg-black/75 text-yellow-300 text-xs font-black text-center shadow-lg border border-white/10">
            {overlays.subtitle}
          </span>
        </div>
      )}

      {overlays?.lowerThird && (
        <div className="absolute bottom-14 left-3 z-20 px-3 py-1 rounded bg-slate-900/85 border-l-4 border-primary text-white text-[10px] font-bold shadow pointer-events-none">
          {overlays.lowerThird}
        </div>
      )}

      {isMultiScene && showSceneBar && (
        <div
          className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/15"
          onClick={(e) => e.stopPropagation()}
        >
          <FiFilm className="text-white text-xs mr-1" />
          {validUrls.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleSceneSelect(idx)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                idx === currentIndex
                  ? "bg-primary text-white shadow"
                  : "text-white/75 hover:text-white hover:bg-white/10"
              }`}
            >
              Escena {idx + 1}
            </button>
          ))}
        </div>
      )}

      {showDownloadButton && (
        <div
          className="absolute bottom-14 right-4 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleDownloadFullVideo}
            disabled={isMerging}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-white text-[11px] font-bold shadow-lg hover:bg-primary-hover transition-all disabled:opacity-60"
          >
            {isMerging ? (
              <>
                <FiLoader className="animate-spin text-xs" />
                <span>Uniendo escenas...</span>
              </>
            ) : (
              <>
                <FiDownload className="text-xs" />
                <span>
                  {isMultiScene
                    ? `Descargar Video Largo (${validUrls.length} escenas)`
                    : "Descargar Video"}
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
