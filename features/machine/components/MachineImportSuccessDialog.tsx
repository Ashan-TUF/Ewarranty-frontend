"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { MachineImportReport } from "../services/machine-import.service";

export function MachineImportSuccessDialog({ result, onClose }: { result: MachineImportReport | null; onClose: () => void }) {
  return <Dialog open={!!result} onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent className="w-[calc(100%-2rem)] max-w-[400px] rounded-2xl border border-border/70 p-0 shadow-xl sm:max-w-[400px]" showCloseButton={false}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex flex-col items-center px-6 pb-6 pt-7 text-center"
      >
        <motion.span
          initial={{ scale: 0.65, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.08 }}
          className="flex size-14 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:text-green-400"
        >
          <CheckCircle2 className="size-8" aria-hidden="true" />
        </motion.span>
        <span className="mt-4 rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-[11px] text-green-700 dark:text-green-400">Success</span>
        <DialogTitle className="mt-3 text-xl font-semibold">Import Completed!</DialogTitle>
        <DialogDescription className="mt-2 text-sm leading-5">Your machine data has been imported successfully.</DialogDescription>
        {(result?.totalRows != null || result?.importedRows != null) && <div className="mt-5 flex w-full flex-wrap gap-4 rounded-xl border bg-muted/30 p-3">
          {result.totalRows != null && <div className="text-left"><p className="text-xs text-muted-foreground">Processed rows</p><p className="mt-1 text-lg font-medium tabular-nums">{result.totalRows.toLocaleString()}</p></div>}
          {result.importedRows != null && <div className="text-left"><p className="text-xs text-muted-foreground">Imported rows</p><p className="mt-1 text-lg font-medium tabular-nums">{result.importedRows.toLocaleString()}</p></div>}
        </div>}
        <Button type="button" className="mt-6 w-full" onClick={onClose}>Done</Button>
      </motion.div>
    </DialogContent>
  </Dialog>;
}
