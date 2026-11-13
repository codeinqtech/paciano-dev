
import type { ContactFormData } from "./contact.types";

interface Props {
  formData: ContactFormData;
  onChange: (field: keyof ContactFormData, value: string) => void;
}

const inputClass =
  "w-full rounded-lg border border-[#E0D5C8] bg-white px-4 py-3 text-sm text-[#332C26] placeholder:text-[#A49A8E] outline-none transition focus:border-[#8FAA42] focus:ring-2 focus:ring-[#8FAA42]/10";

export default function ContactMessageSection({
  formData,
  onChange,
}: Props) {
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

      {/* WhatsApp Number */}
      <div>
        <label className="mb-2 block text-sm font-medium text-[#332C26]">
          WhatsApp Number
        </label>

        <input
          type="tel"
          className={inputClass}
          value={formData.whatsapp_number ?? ""}
          placeholder="Enter WhatsApp number (e.g. 919876543215)"
          onChange={(e) =>
            onChange("whatsapp_number", e.target.value)
          }
        />

        <p className="mt-1 text-xs text-[#82776B]">
          Enter the WhatsApp number with country code.
        </p>
      </div>

      {/* Message Content */}
      <div>
        <label className="mb-2 block text-sm font-medium text-[#332C26]">
          Message Content
        </label>

        <textarea
          rows={6}
          className={`${inputClass} resize-y`}
          value={formData.send_us_message_text}
          placeholder="Enter message content..."
          onChange={(e) =>
            onChange("send_us_message_text", e.target.value)
          }
        />
      </div>
    </div>
  );
}
