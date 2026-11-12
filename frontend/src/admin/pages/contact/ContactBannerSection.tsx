import { AdminImageUpload } from "../../components/MediaFileUploadZone";
import type {
  ContactFormData,
  ContactMediaUrls,
} from "./contact.types";

interface Props {
  formData: ContactFormData;
  mediaUrls: ContactMediaUrls;
  imageFile: File | null;
  onChange: (field: keyof ContactFormData, value: string) => void;
  onImageChange: (file: File | null) => void;
}

const inputClass =
  "w-full rounded-lg border border-[#E0D5C8] bg-white px-4 py-3 text-sm text-[#332C26] placeholder:text-[#A49A8E] outline-none transition focus:border-[#8FAA42] focus:ring-2 focus:ring-[#8FAA42]/10";

const labelClass = "mb-2 block text-sm font-medium text-[#51483F]";

export default function ContactBannerSection({
  formData,
  mediaUrls,
  imageFile,
  onChange,
  onImageChange,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cormorant text-3xl text-[#332C26]">
          Banner & Heading
        </h2>
        <p className="mt-1 text-sm text-[#82776B]">
          Manage the main banner and heading content.
        </p>
      </div>

      <AdminImageUpload
        title="Banner Image"
        file={imageFile}
        existingUrl={mediaUrls.banner_image}
        optional
        onFileChange={onImageChange}
      />

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className={labelClass}>Heading One</label>
          <input
            className={inputClass}
            value={formData.heading_one}
            placeholder="Enter heading one"
            onChange={(e) => onChange("heading_one", e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Heading Two</label>
          <input
            className={inputClass}
            value={formData.heading_two}
            placeholder="Enter heading two"
            onChange={(e) => onChange("heading_two", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Heading Highlight</label>
        <input
          className={inputClass}
          value={formData.heading_highlight}
          placeholder="Enter highlighted text"
          onChange={(e) => onChange("heading_highlight", e.target.value)}
        />
      </div>
    </div>
  );
}
