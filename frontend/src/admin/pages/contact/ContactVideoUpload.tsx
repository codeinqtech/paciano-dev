import { useEffect, useRef, useState } from "react";
import { AlertCircle, Upload, Video } from "@/components/common/icons";

interface Props {
  existingUrl: string | null;
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export default function ContactVideoUpload({
  existingUrl,
  file,
  onFileChange,
}: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!file && previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
      setPreviewUrl(null);
    }
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];
    const validExtension = /\.(mp4|webm|mov)$/i.test(selectedFile.name);

    if (!allowedTypes.includes(selectedFile.type) && !validExtension) {
      alert("Only MP4, WebM and MOV videos are allowed.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      alert("Maximum video size allowed is 50 MB.");
      event.target.value = "";
      return;
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const nextPreviewUrl = URL.createObjectURL(selectedFile);
    previewUrlRef.current = nextPreviewUrl;
    setPreviewUrl(nextPreviewUrl);
    onFileChange(selectedFile);

    // Permit selecting the same file again.
    event.target.value = "";
  };

  const displayedUrl = previewUrl || existingUrl;

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#51483F]">
        Until We Meet Video
      </label>

      <div className="rounded-2xl border border-[#E8DFD0] bg-white p-5 shadow-sm">
        <div className="relative overflow-hidden rounded-xl border border-[#E8DFD0] bg-[#FAF7F2]">
          {displayedUrl ? (
            <video
              key={displayedUrl}
              src={displayedUrl}
              controls
              className="h-56 w-full bg-black object-contain"
            />
          ) : (
            <div className="flex h-56 flex-col items-center justify-center">
              <Video className="mb-3 h-12 w-12 text-[#C8BC82]" />
              <p className="text-sm font-medium text-[#51483F]">
                No video selected
              </p>
              <p className="mt-1 text-xs text-[#A49A8E]">
                Your video preview will appear here
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0">
            {file ? (
              <>
                <p className="truncate text-sm font-semibold text-[#332C26]">
                  {file.name}
                </p>
                <p className="mt-1 text-xs text-[#8A8075]">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-[#332C26]">
                  {displayedUrl ? "Current video" : "Upload video"}
                </p>
                <p className="mt-1 text-xs text-[#8A8075]">
                  Choose a video for this section.
                </p>
              </>
            )}
          </div>

          <label className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#8FAA42] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#788F36]">
            <Upload className="h-4 w-4" />
            {file ? "Change Video" : "Choose Video"}
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime,.mov"
              onChange={handleChange}
              className="hidden"
            />
          </label>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-lg bg-[#FAF7F2] p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#A58B45]" />
          <p className="text-xs leading-relaxed text-[#6E655C]">
            Maximum file size: <strong>50 MB</strong>. Supported formats:
            MP4, WebM and MOV.
          </p>
        </div>
      </div>
    </div>
  );
}
