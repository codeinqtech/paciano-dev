import { Phone, Plus } from "@/components/common/icons";

export default function ContactDetailsSection() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-cormorant text-3xl text-[#332C26]">
            Contact Details
          </h2>
          <p className="mt-1 text-sm text-[#82776B]">
            Manage phone, email and address information.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-[#8FAA42] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#718A38]"
        >
          <Plus size={16} />
          Add New
        </button>
      </div>

      <div className="rounded-xl border border-dashed border-[#D9CEBD] bg-[#F7F3EB] p-10 text-center">
        <Phone className="mx-auto mb-3 h-8 w-8 text-[#B4A88F]" />
        <p className="text-sm text-[#82776B]">
          No contact details loaded yet.
        </p>
      </div>
    </div>
  );
}
