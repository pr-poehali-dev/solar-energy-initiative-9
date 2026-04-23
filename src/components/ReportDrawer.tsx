import { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Icon from "@/components/ui/icon";
import ReportForm from "./ReportForm";

interface ReportDrawerProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const glass: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.12)",
  backdropFilter: "blur(32px) saturate(200%) brightness(1.1)",
  WebkitBackdropFilter: "blur(32px) saturate(200%) brightness(1.1)",
  border: "1px solid rgba(255,255,255,0.25)",
  boxShadow: "0 8px 64px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
};

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
        <Dialog.Overlay className="drawer-overlay fixed inset-0 bg-black/40 z-40" />

        {/* Обёртка с отступами — стекло не прилипает к краям */}
        <div className="fixed inset-y-4 right-4 z-50 w-full max-w-lg drawer-panel flex flex-col" style={{ borderRadius: "24px", overflow: "hidden", ...glass }}>

          {/* Шапка */}
          <div className="px-6 py-5 flex items-center justify-between shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}
          >
            <div className="flex items-center gap-3">
              <Icon name="MapPin" size={16} className="text-white/80" />
              <Dialog.Title className="text-sm uppercase tracking-widest font-bold text-white">
                Отметить место
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="text-white/60 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/15">
                <Icon name="X" size={18} />
              </button>
            </Dialog.Close>
          </div>

          {/* Форма — скролл внутри панели */}
          <div className="flex-1 overflow-y-auto">
            <ReportForm onSuccess={() => onOpenChange(false)} />
          </div>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
