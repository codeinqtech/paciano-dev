import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

export interface ImageCropperProps {
  image: string;
  onCancel: () => void;
  onCropComplete: (file: File) => void;
  aspectRatio?: number;
  fileName?: string;
}

const aspectRatios = [
  { label: "Free", value: 0 },
  { label: "1:1", value: 1 },
  { label: "4:5", value: 4 / 5 },
  { label: "16:9", value: 16 / 9 },
  { label: "16:5", value: 16 / 5 },
];

export default function ImageCropper({
  image,
  onCancel,
  onCropComplete,
  aspectRatio = 0,
  fileName = "cropped-image.jpg",
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedAspect, setSelectedAspect] =
    useState(aspectRatio);

  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<Area | null>(null);

  const [processing, setProcessing] = useState(false);

  const handleCropComplete = useCallback(
    (_: Area, croppedPixels: Area) => {
      setCroppedAreaPixels(croppedPixels);
    },
    []
  );

  const createCroppedImage = async (): Promise<File> => {
    if (!croppedAreaPixels) {
      throw new Error("Please select an image crop area.");
    }

    const imageElement = new Image();
    imageElement.src = image;

    await new Promise<void>((resolve, reject) => {
      imageElement.onload = () => resolve();
      imageElement.onerror = () =>
        reject(new Error("Unable to load image."));
    });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas is not supported.");
    }

    canvas.width = Math.round(croppedAreaPixels.width);
    canvas.height = Math.round(croppedAreaPixels.height);

    context.drawImage(
      imageElement,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) {
            resolve(result);
          } else {
            reject(new Error("Unable to crop image."));
          }
        },
        "image/jpeg",
        0.92
      );
    });

    return new File([blob], fileName, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  };

  const handleApplyCrop = async () => {
    try {
      setProcessing(true);
      const croppedFile = await createCroppedImage();
      onCropComplete(croppedFile);
    } catch (error) {
      console.error("Image crop error:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EDE4D8] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[#332C26]">
              Crop Image
            </h2>
            <p className="mt-1 text-xs text-[#82776B]">
              Adjust the image position and zoom.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-red-100 hover:text-red-600"
            aria-label="Close cropper"
          >
            <X size={20} />
          </button>
        </div>

        {/* Crop Area */}
        <div className="relative h-[350px] w-full bg-[#1F1F1F] sm:h-[450px]">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={
              selectedAspect > 0 ? selectedAspect : undefined
            }
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
            minZoom={1}
            maxZoom={3}
            restrictPosition
          />
        </div>

        {/* Controls */}
        <div className="space-y-5 px-5 py-5">

          {/* Aspect Ratio */}
          <div>
            <p className="mb-3 text-sm font-semibold text-[#51483F]">
              Aspect Ratio
            </p>

            <div className="flex flex-wrap gap-2">
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio.label}
                  type="button"
                  onClick={() => {
                    setSelectedAspect(ratio.value);
                    handleReset();
                  }}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                    selectedAspect === ratio.value
                      ? "border-[#68704D] bg-[#68704D] text-white"
                      : "border-[#E0D5C8] text-[#51483F] hover:border-[#68704D]"
                  }`}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#51483F]">
                Zoom
              </p>
              <span className="text-xs text-[#82776B]">
                {zoom.toFixed(1)}x
              </span>
            </div>

            <div className="flex items-center gap-3">
              <ZoomOut size={18} className="text-[#82776B]" />

              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) =>
                  setZoom(Number(e.target.value))
                }
                className="w-full accent-[#8FAA42]"
              />

              <ZoomIn size={18} className="text-[#82776B]" />
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#68704D] hover:text-[#3d4a22]"
          >
            <RotateCcw size={15} />
            Reset Crop
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-[#EDE4D8] bg-[#FAF9F6] px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="rounded-lg border border-[#E0D5C8] bg-white px-5 py-2.5 text-sm font-medium text-[#51483F] hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApplyCrop}
            disabled={processing || !croppedAreaPixels}
            className="rounded-lg bg-[#8FAA42] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#718A38] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {processing ? "Processing..." : "Apply Crop"}
          </button>
        </div>
      </div>
    </div>
  );
}
