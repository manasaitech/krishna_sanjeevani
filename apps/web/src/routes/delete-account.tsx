import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Trash2,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Mail,
  ArrowLeft,
  Loader2,
  Sparkles,
  HelpCircle,
  Smartphone,
  Globe,
} from "lucide-react";
import { HomeNavbar } from "@/components/home/HomeNavbar";
import { HomeFooter } from "@/components/home/HomeFooter";
import { VerseMiniPlayer } from "@/components/home/VerseMiniPlayer";
import { VersePlayerModal } from "@/components/home/VersePlayerModal";
import { useVerseAudio } from "@/lib/use-verse-audio";
import { useApp } from "@/lib/app-state";
import { api, clearTokens } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/delete-account")({
  head: () => ({
    meta: [
      { title: "Delete Account & Data — Krishna Sanjeevani" },
      {
        name: "description",
        content:
          "Request or complete full account deletion and personal data removal for Krishna Sanjeevani web and mobile apps.",
      },
      { property: "og:title", content: "Delete Account — Krishna Sanjeevani" },
      {
        property: "og:description",
        content: "Account and data deletion instructions and policy for Krishna Sanjeevani.",
      },
    ],
  }),
  component: DeleteAccountPage,
});

function DeleteAccountPage() {
  const audio = useVerseAudio();
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText.trim().toUpperCase() !== "DELETE") {
      toast.error("Please type DELETE to confirm account deletion.");
      return;
    }

    try {
      setIsDeleting(true);
      const res = await api.auth.deleteAccount();
      if (res.success) {
        toast.success("Your account and all associated data have been permanently deleted.");
        clearTokens();
        await logout();
        setShowConfirmModal(false);
        navigate({ to: "/" });
      } else {
        toast.error(res.message || "Failed to delete account. Please try again.");
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred during account deletion.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-cat-light selection:text-cat flex flex-col">
      <VerseMiniPlayer audio={audio} />
      <VersePlayerModal audio={audio} />
      <HomeNavbar />

      <main id="main-content" className="flex-1 pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center space-y-4 mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-red-600 dark:text-red-400 shadow-sm">
              <ShieldAlert className="h-4 w-4" />
              <span>Account & Data Deletion</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight text-foreground">
              Delete Your Krishna Sanjeevani Account
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-sans max-w-xl mx-auto leading-relaxed">
              In full transparency and compliance with Google Play Developer Policies and Privacy Regulations, you have the absolute right to permanently delete your account and all associated data at any time.
            </p>
          </div>

          {/* Interactive Delete Card for Logged In User */}
          {user ? (
            <div className="mb-10 rounded-3xl border border-red-500/30 bg-red-500/5 p-6 sm:p-8 shadow-sm text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-red-600 dark:text-red-400 mb-4">
                <Trash2 className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold font-serif text-foreground">Logged in as {user.profile?.fullName || user.email}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                You are currently signed in. You can initiate your instant account deletion directly below.
              </p>
              <button
                onClick={() => setShowConfirmModal(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 text-sm shadow-md transition-all active:scale-[0.98]"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete My Account Permanently</span>
              </button>
            </div>
          ) : (
            <div className="mb-10 rounded-3xl border border-border bg-surface/60 p-6 sm:p-8 shadow-sm text-center flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left">
                <h2 className="text-base font-semibold text-foreground">Already have an account?</h2>
                <p className="text-xs text-muted-foreground">Sign in to instantly delete your account with one click.</p>
              </div>
              <Link
                to="/login"
                className="shrink-0 rounded-xl bg-cat text-cat-foreground hover:opacity-90 font-medium px-5 py-2.5 text-xs sm:text-sm transition-all shadow-sm"
              >
                Sign In to Delete Account
              </Link>
            </div>
          )}

          {/* Core Content Card */}
          <div className="rounded-3xl border border-border bg-surface/50 p-6 sm:p-10 shadow-lift space-y-10 font-sans text-sm sm:text-base leading-relaxed text-muted-foreground">
            {/* Step-by-Step Instructions */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold font-serif text-foreground flex items-center gap-2">
                <Globe className="h-5 w-5 text-cat" />
                How to Delete Your Account (Web & Mobile App)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border/80 bg-background/50 p-5 space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
                    <Globe className="h-4 w-4 text-cat" />
                    <span>Option A: Via Web Portal</span>
                  </div>
                  <ol className="list-decimal pl-5 text-xs sm:text-sm space-y-1.5 text-muted-foreground">
                    <li>Sign in to your account at <strong>krishnasanjeevani.com</strong></li>
                    <li>Click on your <strong>Profile / Settings</strong> in the top navigation</li>
                    <li>Scroll down to the <strong>Danger Zone</strong> section</li>
                    <li>Click <strong>Delete Account</strong></li>
                    <li>Type <strong>DELETE</strong> and confirm the prompt</li>
                  </ol>
                </div>

                <div className="rounded-2xl border border-border/80 bg-background/50 p-5 space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
                    <Smartphone className="h-4 w-4 text-cat" />
                    <span>Option B: Via Mobile App</span>
                  </div>
                  <ol className="list-decimal pl-5 text-xs sm:text-sm space-y-1.5 text-muted-foreground">
                    <li>Open the <strong>Krishna Sanjeevani</strong> Android or iOS App</li>
                    <li>Go to the <strong>Profile / Account</strong> tab</li>
                    <li>Tap on <strong>Account Settings</strong></li>
                    <li>Select <strong>Delete Account</strong></li>
                    <li>Confirm deletion in the warning dialog</li>
                  </ol>
                </div>
              </div>
            </section>

            {/* Data Breakdown Table */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold font-serif text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-cat" />
                Data Deletion & Retention Overview
              </h2>
              <div className="overflow-x-auto rounded-2xl border border-border">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-muted/40 text-foreground font-semibold border-b border-border">
                    <tr>
                      <th className="p-3.5">Data Category</th>
                      <th className="p-3.5">Action Taken</th>
                      <th className="p-3.5">Details & Retention Period</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    <tr>
                      <td className="p-3.5 font-medium text-foreground">User Profile & Account Info</td>
                      <td className="p-3.5"><span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400">Permanently Deleted</span></td>
                      <td className="p-3.5">Name, email, password hash, language, pregnancy configuration, category preferences deleted immediately.</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-medium text-foreground">Listening History & Progress</td>
                      <td className="p-3.5"><span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400">Permanently Deleted</span></td>
                      <td className="p-3.5">All play logs, track completion status, listening duration, and program progress purged.</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-medium text-foreground">Favorites & Notifications</td>
                      <td className="p-3.5"><span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400">Permanently Deleted</span></td>
                      <td className="p-3.5">Bookmarked surawalis, saved tracks, custom reminders, and in-app notifications erased.</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-medium text-foreground">Active Subscriptions & Tokens</td>
                      <td className="p-3.5"><span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400">Permanently Deleted</span></td>
                      <td className="p-3.5">Active auth sessions, refresh tokens, and streaming tokens instantly revoked and cleared.</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-medium text-foreground">Aggregate Usage Analytics</td>
                      <td className="p-3.5"><span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">Anonymized</span></td>
                      <td className="p-3.5">User ID stripped from server logs. Aggregate play counts retained without personal identifiers.</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-medium text-foreground">Payment & Financial Records</td>
                      <td className="p-3.5"><span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">Retained for Tax/Legal</span></td>
                      <td className="p-3.5">Order IDs & payment amounts retained for 7 years as mandated by tax laws. Disconnected from PII.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Manual Assistance Request */}
            <section className="rounded-2xl border border-border/80 bg-background/40 p-6 space-y-3">
              <h2 className="text-lg font-bold font-serif text-foreground flex items-center gap-2">
                <Mail className="h-5 w-5 text-cat" />
                Request Manual Deletion Support
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                If you encounter any issues deleting your account via the Web Portal or Mobile App, or if you no longer have access to your original login credentials, you can contact our developer support team directly.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <a
                  href="mailto:support@krishnasanjeevani.com?subject=Account%20Deletion%20Request"
                  className="inline-flex items-center gap-2 rounded-xl bg-cat-light border border-cat/30 text-cat font-semibold px-4 py-2.5 text-xs sm:text-sm hover:bg-cat/10 transition-all"
                >
                  <Mail className="h-4 w-4" />
                  <span>Email Developer Support</span>
                </a>
                <span className="text-xs text-muted-foreground">Response time: Within 24-48 hours</span>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-surface p-6 sm:p-8 shadow-2xl space-y-5 animate-rise">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/15">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Confirm Account Deletion</h3>
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              All your profile data, listening history, favorites, program progress, and active sessions will be permanently erased.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-foreground">
                Type <span className="font-mono text-red-600 dark:text-red-400 uppercase font-bold">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmText("");
                }}
                className="flex-1 rounded-xl border border-border bg-surface hover:bg-muted/50 font-semibold py-2.5 text-sm text-foreground transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting || confirmText.trim().toUpperCase() !== "DELETE"}
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 font-semibold py-2.5 text-sm text-white transition-all flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                <span>Delete Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <HomeFooter />
    </div>
  );
}
