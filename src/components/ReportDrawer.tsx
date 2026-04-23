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
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
        <Dialog.Content className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-white overflow-y-auto shadow-2xl focus:outline-none">
          <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
            <Dialog.Title className="text-sm uppercase tracking-widest font-bold text-neutral-900">
              Отметить место
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-neutral-500 hover:text-neutral-900 transition-colors p-1">
                <Icon name="X" size={20} />
              </button>
            </Dialog.Close>
          </div>
          <ReportForm onSuccess={() => onOpenChange(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
