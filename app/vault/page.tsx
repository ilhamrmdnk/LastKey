"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import VaultCard, { VaultItem } from "@/components/VaultCard";
import Footer from "@/components/Footer";
import {
  VaultIcon,
  LockIcon,
  ShieldCheckIcon,
  PlusIcon,
  CheckCircleIcon,
  SearchIcon,
  PulseIcon,
  XIcon,
  FileTextIcon,
  ChevronRightIcon,
  AlertTriangleIcon,
} from "@/components/Icons";

const INITIAL_VAULTS: VaultItem[] = [
  {
    id: "v-1",
    name: "Important Documents",
    fileCount: "3 encrypted files",
    status: "ACTIVE",
    encryptionStatus: "AES-256 GCM",
    lastUpdated: "Updated 2 hours ago",
    description: "Legal papers, credentials, and identity certificates",
  },
  {
    id: "v-2",
    name: "Personal Archive",
    fileCount: "8 encrypted files",
    status: "ACTIVE",
    encryptionStatus: "AES-256 GCM",
    lastUpdated: "Updated yesterday",
    description: "Private keys, personal memoirs, and digital journals",
  },
  {
    id: "v-3",
    name: "Emergency Data",
    fileCount: "2 encrypted files",
    status: "ACTIVE",
    encryptionStatus: "AES-256 GCM",
    lastUpdated: "Updated 3 days ago",
    description: "Emergency contacts, health records, and estate instructions",
  },
  {
    id: "v-4",
    name: "Crypto Cold Storage",
    fileCount: "5 encrypted files",
    status: "ACTIVE",
    encryptionStatus: "AES-256 GCM",
    lastUpdated: "Updated 4 days ago",
    description: "Hardware wallet seeds, BIP-39 mnemonics, and multi-sig recovery shards",
  },
  {
    id: "v-5",
    name: "Financial & Asset Deeds",
    fileCount: "12 encrypted files",
    status: "ACTIVE",
    encryptionStatus: "AES-256 GCM",
    lastUpdated: "Updated 1 week ago",
    description: "Tax returns, title deeds, insurance policies, and offshore bank accounts",
  },
  {
    id: "v-6",
    name: "Master Recovery Escrow",
    fileCount: "1 encrypted file",
    status: "PENDING",
    encryptionStatus: "ChaCha20-Poly1305",
    lastUpdated: "Pending verification",
    description: "Secondary emergency split-key shards awaiting recipient confirmation",
  },
];

interface MockFile {
  name: string;
  size: string;
  cipher: string;
}

const MOCK_VAULT_FILES: Record<string, MockFile[]> = {
  "v-1": [
    { name: "passport_scan_verified.pdf.enc", size: "2.4 MB", cipher: "AES-256 GCM" },
    { name: "birth_certificate_notarized.pdf.enc", size: "1.8 MB", cipher: "AES-256 GCM" },
    { name: "tax_identification_2025.pdf.enc", size: "850 KB", cipher: "AES-256 GCM" },
  ],
  "v-2": [
    { name: "personal_memoirs_vol1.enc", size: "4.2 MB", cipher: "AES-256 GCM" },
    { name: "pgp_private_keyring.asc.enc", size: "128 KB", cipher: "AES-256 GCM" },
    { name: "digital_diary_encrypted.sqlite.enc", size: "14.5 MB", cipher: "AES-256 GCM" },
  ],
  "v-3": [
    { name: "emergency_medical_directives.pdf.enc", size: "1.1 MB", cipher: "AES-256 GCM" },
    { name: "estate_trustee_contact_dossier.pdf.enc", size: "640 KB", cipher: "AES-256 GCM" },
  ],
};

interface MockRecipient {
  id: string;
  name: string;
  role: string;
  email: string;
}

const MOCK_RECIPIENTS: MockRecipient[] = [
  {
    id: "rec-1",
    name: "Sarah Connor",
    role: "Emergency Trustee",
    email: "sarah@trustee-key.org",
  },
  {
    id: "rec-2",
    name: "Alex Vance",
    role: "Legal Counsel",
    email: "alex@vance-legal.com",
  },
  {
    id: "rec-3",
    name: "Michael Scott",
    role: "Next of Kin",
    email: "m.scott@familyvault.net",
  },
  {
    id: "rec-4",
    name: "Elena Rostova",
    role: "Cryptographic Escrow",
    email: "elena@escrow-keys.io",
  },
];

const CHECK_IN_INTERVAL_OPTIONS = [
  { value: "7 days", label: "7 days (Weekly heartbeat)" },
  { value: "14 days", label: "14 days (Bi-weekly heartbeat)" },
  { value: "30 days", label: "30 days (Standard 30-day release cycle)" },
];

const GRACE_PERIOD_OPTIONS = [
  { value: "24 hours", label: "24 hours (Urgent fail-safe window)" },
  { value: "48 hours", label: "48 hours (Standard grace period)" },
  { value: "72 hours", label: "72 hours (Extended emergency buffer)" },
];

interface VaultFormData {
  name: string;
  description: string;
  recipient: string;
  checkInInterval: string;
  gracePeriod: string;
}

interface VaultFormErrors {
  name?: string;
  recipient?: string;
  checkInInterval?: string;
  gracePeriod?: string;
}

const INITIAL_FORM_DATA: VaultFormData = {
  name: "",
  description: "",
  recipient: "",
  checkInInterval: "",
  gracePeriod: "",
};

export default function VaultPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("My Vault");
  const [vaults, setVaults] = useState<VaultItem[]>(INITIAL_VAULTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "PENDING">("ALL");
  const [selectedVault, setSelectedVault] = useState<VaultItem | null>(null);

  // Form & Validation State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<VaultFormData>(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState<VaultFormErrors>({});
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Modal open/close handlers
  const handleOpenCreateModal = () => {
    setFormData(INITIAL_FORM_DATA);
    setFormErrors({});
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setFormErrors({});
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showCreateModal) {
        handleCloseCreateModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showCreateModal]);

  const filteredVaults = vaults.filter((vault) => {
    const matchesSearch =
      vault.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vault.description && vault.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      statusFilter === "ALL" || vault.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const validateForm = (): boolean => {
    const errors: VaultFormErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Vault Name is required.";
    }

    if (!formData.recipient) {
      errors.recipient = "Recipient must be selected.";
    }

    if (!formData.checkInInterval) {
      errors.checkInInterval = "Check-in Interval must be selected.";
    }

    if (!formData.gracePeriod) {
      errors.gracePeriod = "Grace Period must be selected.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    field: keyof VaultFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-specific error as the user enters data
    if (formErrors[field as keyof VaultFormErrors]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCreateNewVault = (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    const selectedRecipientObj = MOCK_RECIPIENTS.find(
      (r) => r.id === formData.recipient
    );
    const recipientDisplayName = selectedRecipientObj
      ? `${selectedRecipientObj.name} (${selectedRecipientObj.role})`
      : "Trusted Recipient";

    const newVault: VaultItem = {
      id: `v-${Date.now()}`,
      name: formData.name.trim(),
      fileCount: "0 encrypted files",
      status: "ACTIVE",
      encryptionStatus: "AES-256 GCM",
      lastUpdated: "Created just now",
      description: formData.description.trim()
        ? `${formData.description.trim()} • Recipient: ${recipientDisplayName} • Interval: ${formData.checkInInterval} • Grace: ${formData.gracePeriod}`
        : `Designated to ${recipientDisplayName} • ${formData.checkInInterval} heartbeat window • ${formData.gracePeriod} grace buffer`,
    };

    setVaults([newVault, ...vaults]);
    setFormData(INITIAL_FORM_DATA);
    setFormErrors({});
    setShowCreateModal(false);
    setFeedbackNotice("Vault created successfully (Demo).");
    setTimeout(() => {
      setFeedbackNotice(null);
    }, 5000);
  };

  const handleManageVault = (id: string) => {
    const found = vaults.find((v) => v.id === id);
    if (found) {
      setSelectedVault(found);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#090a0f] text-zinc-100 antialiased">
      {/* 1. Left Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem={activeNav}
        onSelectItem={setActiveNav}
        userName="Ilham"
        userStatus="Protected"
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* 2. Top Navbar */}
        <Navbar
          onToggleSidebar={() => setSidebarOpen(true)}
          title="My Vault"
          userName="Ilham"
          userStatus="Protected"
        />

        {/* Vault Main Container */}
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-8">
            {/* Top Back Navigation Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/60 pb-4">
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  aria-label="Return to Dashboard"
                >
                  <span aria-hidden="true">&larr;</span>
                  <span>Back to Dashboard</span>
                </Link>
                <span className="text-zinc-600 hidden sm:inline">|</span>
                <span className="text-xs text-zinc-400 hidden sm:inline">
                  Digital Vault Manager
                </span>
              </div>

              {/* Quick Link to Check-in */}
              <Link
                href="/check-in"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-400 transition-all hover:bg-emerald-500/20 hover:text-emerald-300"
              >
                <PulseIcon className="h-3.5 w-3.5 text-emerald-400" />
                <span>Dead Man&apos;s Switch: Active</span>
                <ChevronRightIcon className="h-3 w-3" />
              </Link>
            </div>

            {/* Hero / Header Section */}
            <section
              aria-label="Vault Overview"
              className="relative flex flex-col justify-between gap-4 rounded-2xl border border-zinc-800/80 bg-gradient-to-r from-zinc-900/70 via-zinc-900/30 to-[#090a0f] p-6 shadow-sm sm:flex-row sm:items-center sm:p-7"
            >
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="font-mono tracking-wider">
                    ZERO-KNOWLEDGE STORAGE
                  </span>
                </div>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
                  Encrypted Vaults
                </h1>
                <p className="mt-1.5 text-xs text-zinc-400 sm:text-sm">
                  Client-side encrypted compartments protected by your master key and emergency release rules.
                </p>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  aria-haspopup="dialog"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-zinc-950 transition-all hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>+ New Vault</span>
                </button>
              </div>
            </section>

            {/* Notification Toast */}
            {feedbackNotice && (
              <div
                role="status"
                aria-live="polite"
                className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-3.5 text-xs text-emerald-300 animate-fadeIn"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="font-medium">{feedbackNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFeedbackNotice(null)}
                  className="text-zinc-400 hover:text-zinc-200"
                  aria-label="Dismiss notification"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Key Vault Statistics */}
            <section aria-label="Vault Statistics">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total Compartments"
                  value={vaults.length.toString()}
                  description="Encrypted vaults"
                  icon={<VaultIcon className="h-5 w-5" />}
                  badge="Configured"
                />
                <StatCard
                  title="Encryption Standard"
                  value="AES-256"
                  description="Galois/Counter Mode"
                  icon={<LockIcon className="h-5 w-5" />}
                  isAccent={true}
                  badge="Hardware-grade"
                />
                <StatCard
                  title="Protection State"
                  value="Zero-Knowledge"
                  description="Keys never leave client"
                  icon={<ShieldCheckIcon className="h-5 w-5" />}
                  badge="Verified"
                />
                <StatCard
                  title="Fail-Safe Trigger"
                  value="Armed"
                  description="Connected to switch"
                  icon={<PulseIcon className="h-5 w-5" />}
                  isAccent={true}
                  badge="Monitoring"
                />
              </div>
            </section>

            {/* Search, Filter Bar and Vault Grid */}
            <section aria-label="Vault Compartments List" className="space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <SearchIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search vaults by name or description..."
                    aria-label="Search vaults"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2 pl-9 pr-4 text-xs text-zinc-100 placeholder-zinc-500 transition-colors focus:border-emerald-500/50 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200"
                      aria-label="Clear search"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Status Filter Tabs */}
                <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-1">
                  <button
                    type="button"
                    onClick={() => setStatusFilter("ALL")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      statusFilter === "ALL"
                        ? "bg-zinc-800 text-emerald-400 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    All ({vaults.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("ACTIVE")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      statusFilter === "ACTIVE"
                        ? "bg-zinc-800 text-emerald-400 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Active ({vaults.filter((v) => v.status === "ACTIVE").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("PENDING")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      statusFilter === "PENDING"
                        ? "bg-zinc-800 text-emerald-400 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Pending ({vaults.filter((v) => v.status === "PENDING").length})
                  </button>
                </div>
              </div>

              {/* Vault Cards Grid */}
              {filteredVaults.length === 0 ? (
                <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/20 p-12 text-center">
                  <VaultIcon className="mx-auto h-8 w-8 text-zinc-500" />
                  <p className="mt-3 text-sm font-medium text-zinc-300">
                    No vaults found matching your criteria
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Try adjusting your search query or status filter.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("ALL");
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredVaults.map((vault) => (
                    <VaultCard
                      key={vault.id}
                      vault={vault}
                      onManage={handleManageVault}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Bottom Cross-Navigation Banner */}
            <section
              aria-label="Cross Navigation"
              className="flex flex-col items-center justify-between gap-4 rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-5 sm:flex-row sm:p-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                  <PulseIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Dead Man&apos;s Switch Heartbeat
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Keep your switch reset to prevent automated emergency shard release.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
                >
                  Dashboard
                </Link>
                <Link
                  href="/check-in"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-zinc-950 transition-all hover:bg-emerald-400"
                >
                  <span>Go to Check-in</span>
                  <ChevronRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
            </section>

            {/* 3. Footer */}
            <Footer />
          </div>
        </main>
      </div>

      {/* Demo Modal: Manage Vault Inspection */}
      {selectedVault && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="manage-vault-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#0c0e14] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  <VaultIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3
                    id="manage-vault-title"
                    className="text-base font-bold text-zinc-100"
                  >
                    {selectedVault.name}
                  </h3>
                  <span className="font-mono text-[11px] text-emerald-400">
                    {selectedVault.encryptionStatus}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVault(null)}
                aria-label="Close vault inspection"
                className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-1.5 text-zinc-400 hover:text-zinc-200"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-zinc-400">
                {selectedVault.description || "Secure digital container."}
              </p>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Encrypted Payload Contents (Demo Inspection)
                </p>
                <div className="mt-2 space-y-2 rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-3">
                  {(MOCK_VAULT_FILES[selectedVault.id] || [
                    { name: "archive_payload_shard_1.bin.enc", size: "3.2 MB", cipher: "AES-256 GCM" },
                    { name: "credential_manifest.json.enc", size: "48 KB", cipher: "AES-256 GCM" },
                  ]).map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center justify-between rounded-lg bg-zinc-900/60 p-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileTextIcon className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span className="truncate font-mono text-zinc-200">
                          {file.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 shrink-0">
                        <span>{file.size}</span>
                        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-emerald-400">
                          {file.cipher}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 text-[11px] text-emerald-300">
                <span className="font-semibold">Zero-Knowledge Guarantee:</span> This vault is locally encrypted. In emergency release, only authenticated Dead Man&apos;s Switch recipients can reconstruct the shard keys.
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-zinc-800/80 pt-4">
              <button
                type="button"
                onClick={() => setSelectedVault(null)}
                className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create New Vault with Client-Side Validation */}
      {showCreateModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-vault-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs overflow-y-auto"
        >
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#0c0e14] p-6 shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  <PlusIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3
                    id="create-vault-title"
                    className="text-base font-bold text-zinc-100"
                  >
                    Create New Digital Vault
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Configure vault compartment and Dead Man&apos;s Switch parameters
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseCreateModal}
                aria-label="Close modal"
                className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-1.5 text-zinc-400 hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateNewVault} noValidate className="mt-5 space-y-4">
              {/* Field 1: Vault Name */}
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="vault-name"
                    className="block text-xs font-medium text-zinc-200"
                  >
                    Vault Name <span className="text-emerald-400 font-semibold" aria-hidden="true">*</span>
                  </label>
                  <span className="text-[10px] text-zinc-500">Required</span>
                </div>
                <div className="relative mt-1.5">
                  <input
                    id="vault-name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g. Master Private Keys & Passphrases"
                    aria-required="true"
                    aria-invalid={Boolean(formErrors.name)}
                    aria-describedby={formErrors.name ? "vault-name-error" : undefined}
                    className={`w-full rounded-xl border bg-zinc-900/80 px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 transition-colors focus:outline-none focus:ring-2 ${
                      formErrors.name
                        ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30"
                        : "border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/40"
                    }`}
                  />
                </div>
                {formErrors.name && (
                  <p
                    id="vault-name-error"
                    role="alert"
                    className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-400"
                  >
                    <AlertTriangleIcon className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                    <span>{formErrors.name}</span>
                  </p>
                )}
              </div>

              {/* Field 2: Description (Optional) */}
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="vault-description"
                    className="block text-xs font-medium text-zinc-200"
                  >
                    Description
                  </label>
                  <span className="text-[10px] text-zinc-500">Optional</span>
                </div>
                <textarea
                  id="vault-description"
                  name="description"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe the category of assets stored in this compartment..."
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              {/* Field 3: Recipient */}
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="vault-recipient"
                    className="block text-xs font-medium text-zinc-200"
                  >
                    Emergency Recipient <span className="text-emerald-400 font-semibold" aria-hidden="true">*</span>
                  </label>
                  <span className="text-[10px] text-zinc-500">Required</span>
                </div>
                <div className="relative mt-1.5">
                  <select
                    id="vault-recipient"
                    name="recipient"
                    value={formData.recipient}
                    onChange={(e) => handleInputChange("recipient", e.target.value)}
                    aria-required="true"
                    aria-invalid={Boolean(formErrors.recipient)}
                    aria-describedby={formErrors.recipient ? "vault-recipient-error" : undefined}
                    className={`w-full rounded-xl border bg-zinc-900/90 px-3.5 py-2.5 text-xs text-zinc-100 transition-colors focus:outline-none focus:ring-2 ${
                      formErrors.recipient
                        ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30"
                        : "border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/40"
                    }`}
                  >
                    <option value="" className="bg-zinc-900 text-zinc-500">
                      Select a trusted recipient...
                    </option>
                    {MOCK_RECIPIENTS.map((rec) => (
                      <option key={rec.id} value={rec.id} className="bg-zinc-900 text-zinc-100">
                        {rec.name} — {rec.role} ({rec.email})
                      </option>
                    ))}
                  </select>
                </div>
                {formErrors.recipient && (
                  <p
                    id="vault-recipient-error"
                    role="alert"
                    className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-400"
                  >
                    <AlertTriangleIcon className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                    <span>{formErrors.recipient}</span>
                  </p>
                )}
              </div>

              {/* Grid: Check-in Interval & Grace Period */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Field 4: Check-in Interval */}
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="vault-check-in-interval"
                      className="block text-xs font-medium text-zinc-200"
                    >
                      Check-in Interval <span className="text-emerald-400 font-semibold" aria-hidden="true">*</span>
                    </label>
                  </div>
                  <div className="relative mt-1.5">
                    <select
                      id="vault-check-in-interval"
                      name="checkInInterval"
                      value={formData.checkInInterval}
                      onChange={(e) => handleInputChange("checkInInterval", e.target.value)}
                      aria-required="true"
                      aria-invalid={Boolean(formErrors.checkInInterval)}
                      aria-describedby={formErrors.checkInInterval ? "vault-interval-error" : undefined}
                      className={`w-full rounded-xl border bg-zinc-900/90 px-3.5 py-2.5 text-xs text-zinc-100 transition-colors focus:outline-none focus:ring-2 ${
                        formErrors.checkInInterval
                          ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30"
                          : "border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/40"
                      }`}
                    >
                      <option value="" className="bg-zinc-900 text-zinc-500">
                        Select interval...
                      </option>
                      {CHECK_IN_INTERVAL_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-zinc-900 text-zinc-100">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formErrors.checkInInterval && (
                    <p
                      id="vault-interval-error"
                      role="alert"
                      className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-400"
                    >
                      <AlertTriangleIcon className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                      <span>{formErrors.checkInInterval}</span>
                    </p>
                  )}
                </div>

                {/* Field 5: Grace Period */}
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="vault-grace-period"
                      className="block text-xs font-medium text-zinc-200"
                    >
                      Grace Period <span className="text-emerald-400 font-semibold" aria-hidden="true">*</span>
                    </label>
                  </div>
                  <div className="relative mt-1.5">
                    <select
                      id="vault-grace-period"
                      name="gracePeriod"
                      value={formData.gracePeriod}
                      onChange={(e) => handleInputChange("gracePeriod", e.target.value)}
                      aria-required="true"
                      aria-invalid={Boolean(formErrors.gracePeriod)}
                      aria-describedby={formErrors.gracePeriod ? "vault-grace-error" : undefined}
                      className={`w-full rounded-xl border bg-zinc-900/90 px-3.5 py-2.5 text-xs text-zinc-100 transition-colors focus:outline-none focus:ring-2 ${
                        formErrors.gracePeriod
                          ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30"
                          : "border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/40"
                      }`}
                    >
                      <option value="" className="bg-zinc-900 text-zinc-500">
                        Select grace period...
                      </option>
                      {GRACE_PERIOD_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-zinc-900 text-zinc-100">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formErrors.gracePeriod && (
                    <p
                      id="vault-grace-error"
                      role="alert"
                      className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-400"
                    >
                      <AlertTriangleIcon className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                      <span>{formErrors.gracePeriod}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Security Hint */}
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 text-[11px] text-zinc-400">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-300">
                  <LockIcon className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Client-Side Dead Man&apos;s Switch</span>
                </div>
                <p className="mt-1 leading-relaxed">
                  Keys are partitioned using Shamir Secret Sharing. If no heartbeat occurs during the selected interval + grace window, release shards are dispatched to the selected recipient.
                </p>
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2 text-xs font-semibold text-zinc-950 transition-all hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Create Vault</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
