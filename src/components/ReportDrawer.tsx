import * as Dialog from "@radix-ui/react-dialog";
import Icon from "@/components/ui/icon";
import ReportForm from "./ReportForm";

interface ReportDrawerProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function ReportDrawer({ open, onOpenChange }: ReportDrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="drawer-overlay fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" />
        <Dialog.Content className="drawer-panel fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl bg-white overflow-y-auto shadow-2xl focus:outline-none flex flex-col">

          {/* Шапка панели */}
          <div className="sticky top-0 z-10 bg-black text-white px-6 py-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <Icon name="MapPin" size={16} className="text-white/70" />
              <Dialog.Title className="text-sm uppercase tracking-widest font-bold">
                Отметить место
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="text-white/60 hover:text-white transition-colors p-1 rounded-sm hover:bg-white/10">
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
