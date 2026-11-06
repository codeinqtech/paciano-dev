import { AdminImageUpload } from "../../components/MediaFileUploadZone";
import type {
  ContactFormData,
  ContactMediaUrls,
} from "./contact.types";

interface Props {
  formData: ContactFormData;
  mediaUrls: ContactMediaUrls;
  imageOneFile: File | null;
  imageTwoFile: File | null;
  onChange: (field: keyof ContactFormData, value: string) => void;
  onImageOneChange: (file: File | null) => void;
  onImageTwoChange: (file: File | null) => void;
}

const inputClass =
  "w-full rounded-lg border border-[#E0D5C8] bg-white px-4 py-3 text-sm text-[#332C26] placeholder:text-[#A49A8E] outline-none transition focus:border-[#8FAA42] focus:ring-2 focus:ring-[#8FAA42]/10";

const labelClass = "mb-2 block text-sm font-medium text-[#51483F]";

export default function ContactConnectSection({
  formData,
  mediaUrls,
  imageOneFile,
  imageTwoFile,
  onChange,
  onImageOneChange,
  onImageTwoChange,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cormorant text-3xl text-[#332C26]">
          Connect With Us
        </h2>
        <p className="mt-1 text-sm text-[#82776B]">
          Manage connection content and images.
        </p>
      </div>

      <div>
        <label className={labelClass}>Connect With Us</label>
        <textarea
          rows={4}
          className={`${inputClass} resize-y`}
          value={formData.connect_with_us}
          placeholder="Enter content..."
          onChange={(e) => onChange("connect_with_us", e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass}>Supporting Text</label>
        <textarea
          rows={5}
          className={`${inputClass} resize-y`}
          value={formData.connect_with_us_supporting_text}
          placeholder="Enter supporting text..."
          onChange={(e) =>
            onChange("connect_with_us_supporting_text", e.target.value)
          }
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <AdminImageUpload
          title="Image One"
          file={imageOneFile}
          existingUrl={mediaUrls.connect_with_us_image_one}
          optional
          onFileChange={onImageOneChange}
        />

        <AdminImageUpload
          title="Image Two"
          file={imageTwoFile}
          existingUrl={mediaUrls.connect_with_us_image_two}
          optional
          onFileChange={onImageTwoChange}
        />
      </div>
    </div>
  );
}
