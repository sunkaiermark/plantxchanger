"use client";

import { useState } from "react";
import { FileText, X } from "lucide-react";
import { InquiryForm } from "@/components/inquiry-form";
import type { EquipmentSummary } from "@/lib/strapi/types";

export function QuoteRequestModal({ equipment }: { equipment: EquipmentSummary }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-16 w-full items-center justify-center gap-3 bg-[#ff3d00] px-6 font-mono text-lg font-black uppercase tracking-[0.04em] text-white transition hover:bg-[#e53600]"
      >
        <FileText size={22} />
        Request official quote
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/58 px-4 py-8">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-[#dedede] bg-[#f6f6f6] shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#dedede] bg-white p-6">
              <div>
                <p className="font-mono text-sm font-black uppercase tracking-[0.18em] text-[#ff3d00]">
                  Quote request
                </p>
                <h2 className="mt-2 text-3xl font-black uppercase leading-tight text-[#202329]">
                  {equipment.reference}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#dedede] text-[#202329] transition hover:border-[#ff3d00] hover:text-[#ff3d00]"
                aria-label="Close quote request"
              >
                <X size={22} />
              </button>
            </div>
            <div className="p-6">
              <InquiryForm equipment={equipment} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
