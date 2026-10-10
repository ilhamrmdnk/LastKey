import React from "react";
import { VaultIcon, LockIcon, ChevronRightIcon } from "./Icons";

export interface VaultItem {
  id: string;
  name: string;
  fileCount: string;
  status: "ACTIVE" | "LOCKED" | "PENDING";
  encryptionStatus: string;
  lastUpdated: string;
  description?: string;
}

export interface VaultCardProps {
  vault: VaultItem;
  onManage?: (id: string) => void;
}

export function VaultCard({ vault, onManage }: VaultCardProps) {
  const handleManageClick = () => {
    if (onManage) {
      onManage(vault.id);
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 transition-all duration-200 hover:border-zinc-700/80 hover:bg-zinc-900/60">
      <div>
        {/* Top header: Icon & Status */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-800/50 text-emerald-400 group-hover:border-zinc-700">
            <VaultIcon className="h-5 w-5" />
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{vault.status}</span>
          </div>
        </div>

        {/* Vault Info */}
        <div className="mt-4">
          <h3 className="text-base font-semibold text-zinc-100 group-hover:text-emerald-300 transition-colors">
            {vault.name}
          </h3>
          <p className="mt-1 text-xs text-zinc-400">{vault.fileCount}</p>
        </div>

        {/* Encryption & Security Meta */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-zinc-800/60 pt-3 text-xs text-zinc-400">
          <span className="inline-flex items-center gap-1 rounded bg-zinc-800/70 px-2 py-0.5 font-mono text-[11px] text-zinc-300 border border-zinc-700/50">
            <LockIcon className="h-3 w-3 text-emerald-400" />
            {vault.encryptionStatus}
          </span>
          <span className="text-zinc-500">•</span>
          <span className="text-[11px] text-zinc-400">{vault.lastUpdated}</span>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-5 pt-2">
        <button
          type="button"
          onClick={handleManageClick}
          aria-label={`Manage vault ${vault.name}`}
          className="flex w-full items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800/30 px-3.5 py-2 text-xs font-medium text-zinc-200 transition-colors hover:border-zinc-700 hover:bg-zinc-800/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        >
          <span>Manage Vault</span>
          <ChevronRightIcon className="h-3.5 w-3.5 text-zinc-400 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

export default VaultCard;
