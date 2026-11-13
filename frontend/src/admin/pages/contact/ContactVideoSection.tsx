import ContactVideoUpload from "./ContactVideoUpload";
import type { ContactFormData, ContactMediaUrls } from "./contact.types";

interface Props {
  formData: ContactFormData;
  mediaUrls: ContactMediaUrls;
  videoFile: File | null;
  onChange: (field: keyof ContactFormData, value: string) => void;
  onVideoChange: (file: File | null) => void;
}

const inputClass =
  "w-full rounded-lg border border-[#E0D5C8] bg-white px-4 py-3 text-sm text-[#332C26] placeholder:text-[#A49A8E] outline-none transition focus:border-[#8FAA42] focus:ring-2 focus:ring-[#8FAA42]/10";

export default function ContactVideoSection({
  formData,
  mediaUrls,
  videoFile,
  onChange,
  onVideoChange,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cormorant text-3xl text-[#332C26]">
          Until We Meet
        </h2>
        <p className="mt-1 text-sm text-[#82776B]">
          Manage closing content and video.
        </p>
      </div>

      <textarea
        rows={5}
        className={`${inputClass} resize-y`}
        value={formData.until_we_meet_text}
        placeholder="Enter content..."
        onChange={(e) => onChange("until_we_meet_text", e.target.value)}
      />

      <ContactVideoUpload
        existingUrl={mediaUrls.until_we_meet_video}
        file={videoFile}
        onFileChange={onVideoChange}
      />
    </div>
  );
}
