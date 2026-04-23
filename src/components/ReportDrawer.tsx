import { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Icon from "@/components/ui/icon";
import ReportForm from "./ReportForm";

interface ReportDrawerProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function ReportDrawer({ open, onOpenChange }: ReportDrawerProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="drawer-overlay fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
        <Dialog.Content className="drawer-panel fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl overflow-y-auto shadow-2xl focus:outline-none flex flex-col bg-white">

          {/* Шапка — стекло */}
          <div className="sticky top-0 z-10 px-6 py-5 flex items-center justify-between shrink-0 border-b border-white/20"
            style={{
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
            }}
          >
            <div className="flex items-center gap-3">
              <Icon name="MapPin" size={16} className="text-neutral-700" />
              <Dialog.Title className="text-sm uppercase tracking-widest font-bold text-neutral-900">
                Отметить место
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="text-neutral-500 hover:text-neutral-900 transition-colors p-1 rounded-sm hover:bg-black/10">
                <Icon name="X" size={20} />
              </button>
            </Dialog.Close>
          </div>

          {/* Форма */}
          <div className="flex-1">
            <ReportForm onSuccess={() => onOpenChange(false)} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
