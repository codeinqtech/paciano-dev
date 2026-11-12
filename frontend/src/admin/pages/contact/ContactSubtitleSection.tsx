import type { ContactFormData } from "./contact.types";

interface Props {
  formData: ContactFormData;
  onChange: (field: keyof ContactFormData, value: string) => void;
}

const inputClass =
  "w-full rounded-lg border border-[#E0D5C8] bg-white px-4 py-3 text-sm text-[#332C26] placeholder:text-[#A49A8E] outline-none transition focus:border-[#8FAA42] focus:ring-2 focus:ring-[#8FAA42]/10";

const labelClass = "mb-2 block text-sm font-medium text-[#51483F]";

export default function ContactSubtitleSection({ formData, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cormorant text-3xl text-[#332C26]">Subtitles</h2>
        <p className="mt-1 text-sm text-[#82776B]">
          Manage supporting subtitles.
        </p>
      </div>

      <div>
        <label className={labelClass}>Subtitle One</label>
        <textarea
          rows={4}
          className={`${inputClass} resize-y`}
          value={formData.subtitle_one}
          placeholder="Enter subtitle one..."
          onChange={(e) => onChange("subtitle_one", e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass}>Subtitle Two</label>
        <textarea
          rows={4}
          className={`${inputClass} resize-y`}
          value={formData.subtitle_two}
          placeholder="Enter subtitle two..."
          onChange={(e) => onChange("subtitle_two", e.target.value)}
        />
      </div>
    </div>
  );
}
