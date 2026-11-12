import type { ContactFormData } from "./contact.types";

interface Props {
  formData: ContactFormData;
  onChange: (field: keyof ContactFormData, value: string) => void;
}

const inputClass =
  "w-full rounded-lg border border-[#E0D5C8] bg-white px-4 py-3 text-sm text-[#332C26] placeholder:text-[#A49A8E] outline-none transition focus:border-[#8FAA42] focus:ring-2 focus:ring-[#8FAA42]/10";

export default function ContactMessageSection({ formData, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cormorant text-3xl text-[#332C26]">
          Send Us a Message
        </h2>
        <p className="mt-1 text-sm text-[#82776B]">
          Manage the message section content.
        </p>
      </div>

      <textarea
        rows={6}
        className={`${inputClass} resize-y`}
        value={formData.send_us_message_text}
        placeholder="Enter message content..."
        onChange={(e) => onChange("send_us_message_text", e.target.value)}
      />
    </div>
  );
}
