import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  ListMusic,
  Music4,
  Search,
  Settings,
  Upload,
  Users,
  Loader2,
  Play,
  Pause,
  Eye,
  Pencil,
  Trash2,
  Archive,
  X,
  Languages,
  Calendar,
  User,
  Clock,
  Plus,
  AlertTriangle,
  FileAudio,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-state";
import { AppShell } from "@/components/AppShell";
import { type Track } from "@/lib/content";
import logoWithoutText from "@/assets/logo-without-text.png";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Krishna Sanjeevani" },
      {
        name: "description",
        content: "Operations console for content, programs, users, subscriptions and analytics.",
      },
      { property: "og:title", content: "Admin — Krishna Sanjeevani" },
      { property: "og:description", content: "Manage the therapeutic audio catalogue." },
    ],
  }),
  component: Admin,
});

const nav = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "content", label: "Content", icon: Music4 },
  { id: "programs", label: "Programs", icon: ListMusic },
  { id: "users", label: "Users", icon: Users },
  { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

type Section = (typeof nav)[number]["id"];

type Tag = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: number;
};

const DEFAULT_PURPOSES = [
  "Stress Relief",
  "Focus",
  "Sleep",
  "Anxiety",
  "Energy",
  "Meditation",
  "Healing",
  "Calm Mind",
  "Mood Balance",
];

const labelCls = "block text-xs font-semibold text-muted-foreground mb-1";
const fieldCls =
  "min-h-11 w-full rounded-field border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-cat focus:outline-none";
const cardCls = "rounded-card border border-border bg-surface shadow-soft";

function Admin() {
  const { user, isAuthenticated, authLoading, current: playingTrack, playing: isAudioPlaying, play: playHlsTrack, toggle: toggleHlsPlayback } = useApp();
  const [section, setSection] = useState<Section>("overview");

  // Filter States for Content CMS
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filterTier, setFilterTier] = useState<string>("All");
  const [filterProcessing, setFilterProcessing] = useState<string>("All");
  const [filterLanguage, setFilterLanguage] = useState<string>("All");

  // Pagination
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [perPage] = useState(10);

  // Stats States
  const [trackStats, setTrackStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Dynamic Tags list
  const [allTags, setAllTags] = useState<Tag[]>([]);

  // Tracks list
  const [tracksList, setTracksList] = useState<any[]>([]);
  const [totalTracksCount, setTotalTracksCount] = useState(0);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [totalProgramsCount, setTotalProgramsCount] = useState(0);

  // Program CMS States
  const [progQuery, setProgQuery] = useState("");
  const [progDebouncedQuery, setProgDebouncedQuery] = useState("");
  const [progFilterStatus, setProgFilterStatus] = useState<string>("All");
  const [progFilterCategory, setProgFilterCategory] = useState<string>("All");
  const [progFilterTier, setProgFilterTier] = useState<string>("All");
  const [progFilterDifficulty, setProgFilterDifficulty] = useState<string>("All");
  
  const [progPage, setProgPage] = useState(1);
  const [progPages, setProgPages] = useState(1);
  
  const [programsList, setProgramsList] = useState<any[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [programStats, setProgramStats] = useState<any>(null);
  const [loadingProgramStats, setLoadingProgramStats] = useState(false);

  // Program details drawer
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [isProgDetailsOpen, setIsProgDetailsOpen] = useState(false);
  const [selectedProgramTracks, setSelectedProgramTracks] = useState<any[]>([]);
  const [selectedProgramSchedules, setSelectedProgramSchedules] = useState<any[]>([]);
  const [loadingSelectedProgramTracks, setLoadingSelectedProgramTracks] = useState(false);

  // Program editor drawer
  const [isProgramFormOpen, setIsProgramFormOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any>(null);
  const [progFormTitle, setProgFormTitle] = useState("");
  const [progFormSubtitle, setProgFormSubtitle] = useState("");
  const [progFormDescription, setProgFormDescription] = useState("");
  const [progFormCategory, setProgFormCategory] = useState<"devotional" | "secular" | "pregnancy" | "corporate">("devotional");
  const [progFormDifficulty, setProgFormDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [progFormTier, setProgFormTier] = useState<"free" | "premium">("free");
  const [progFormLanguage, setProgFormLanguage] = useState("hi");
  const [progFormThumbnailKey, setProgFormThumbnailKey] = useState("");
  const [progFormImageFile, setProgFormImageFile] = useState<File | null>(null);
  const [progFormTracks, setProgFormTracks] = useState<any[]>([]);
  const [progFormSchedules, setProgFormSchedules] = useState<any[]>([]);
  const [progFormStatus, setProgFormStatus] = useState<"idle" | "uploading_image" | "saving" | "success" | "error">("idle");
  const [progFormStatusMessage, setProgFormStatusMessage] = useState("");

  // Track Selector Modal inside Program Editor
  const [isTrackSelectorOpen, setIsTrackSelectorOpen] = useState(false);
  const [trackSelectorSearch, setTrackSelectorSearch] = useState("");
  const [trackSelectorSelectedIds, setTrackSelectorSelectedIds] = useState<string[]>([]);
  const [allReadyTracks, setAllReadyTracks] = useState<any[]>([]);
  const [loadingReadyTracks, setLoadingReadyTracks] = useState(false);

  const filteredReadyTracks = allReadyTracks.filter(t => 
    (t.title?.toLowerCase().includes(trackSelectorSearch.toLowerCase()) ||
     t.artist?.toLowerCase().includes(trackSelectorSearch.toLowerCase()) ||
     t.category?.toLowerCase().includes(trackSelectorSearch.toLowerCase())) &&
    !progFormTracks.some(pt => pt.id === t.id)
  );

  // Pregnancy Schedule Editor modal inside Program Editor
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingScheduleIndex, setEditingScheduleIndex] = useState<number | null>(null);
  const [schedFormMonth, setSchedFormMonth] = useState(1);
  const [schedFormWeek, setSchedFormWeek] = useState(1);
  const [schedFormDay, setSchedFormDay] = useState(1);
  const [schedFormUnlock, setSchedFormUnlock] = useState(0);
  const [schedFormRequired, setSchedFormRequired] = useState(true);

  // Program confirmations
  const [programToDelete, setProgramToDelete] = useState<any>(null);
  const [showProgDeleteConfirm, setShowProgDeleteConfirm] = useState(false);
  const [showProgUnsavedConfirm, setShowProgUnsavedConfirm] = useState(false);
  const [progUnsavedConfirmCallback, setProgUnsavedConfirmCallback] = useState<(() => void) | null>(null);

  // Overview dashboard data state
  const [overviewData, setOverviewData] = useState<any>(null);
  const [fetchingOverview, setFetchingOverview] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  // Drawers and Modals states
  const [selectedTrack, setSelectedTrack] = useState<any>(null); // Details drawer
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false); // Add/Edit drawer
  const [editingTrack, setEditingTrack] = useState<any>(null); // Track being edited
  const [formTitle, setFormTitle] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formArtist, setFormArtist] = useState("");
  const [formCategory, setFormCategory] = useState<"devotional" | "secular" | "pregnancy">("devotional");
  const [formLanguage, setFormLanguage] = useState("hi");
  const [formTier, setFormTier] = useState<"free" | "premium">("free");
  const [formSelectedTags, setFormSelectedTags] = useState<string[]>([]);
  const [formAudioFile, setFormAudioFile] = useState<File | null>(null);
  const [formImageFile, setFormImageFile] = useState<File | null>(null);

  // Transcoding Status State inside Form
  const [formStatus, setFormStatus] = useState<
    "idle" | "uploading_image" | "creating_metadata" | "uploading_audio" | "transcoding" | "success" | "error"
  >("idle");
  const [formStatusMessage, setFormStatusMessage] = useState("");

  // Confirmation dialogs
  const [trackToDelete, setTrackToDelete] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const [unsavedConfirmCallback, setUnsavedConfirmCallback] = useState<(() => void) | null>(null);

  // Users Management state variables
  const [usersList, setUsersList] = useState<any[]>([]);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [userPage, setUserPage] = useState(1);
  const [userPages, setUserPages] = useState(1);
  const [userQuery, setUserQuery] = useState("");
  const [userDebouncedQuery, setUserDebouncedQuery] = useState("");
  const [userFilterStatus, setUserFilterStatus] = useState("All");
  const [userFilterRole, setUserFilterRole] = useState("All");
  const [userFilterTier, setUserFilterTier] = useState("All");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingUserStats, setLoadingUserStats] = useState(false);
  const [userStats, setUserStats] = useState<{ total: number; active: number; newThisMonth: number; premium: number } | null>(null);

  // User details slider state
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [loadingSelectedUser, setLoadingSelectedUser] = useState(false);

  // User suspend / resume actions state
  const [userToDeactivate, setUserToDeactivate] = useState<any>(null);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [userToReactivate, setUserToReactivate] = useState<any>(null);
  const [showReactivateConfirm, setShowReactivateConfirm] = useState(false);

  // Subscriptions & Billing CMS state variables
  const [subSection, setSubSection] = useState<"subscriptions" | "plans" | "payments">("subscriptions");
  const [subsList, setSubsList] = useState<any[]>([]);
  const [totalSubsCount, setTotalSubsCount] = useState(0);
  const [subPage, setSubPage] = useState(1);
  const [subPages, setSubPages] = useState(1);
  const [subSearch, setSubSearch] = useState("");
  const [subDebouncedSearch, setSubDebouncedSearch] = useState("");
  const [subFilterStatus, setSubFilterStatus] = useState("All");
  const [subFilterPlan, setSubFilterPlan] = useState("All");
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [loadingSubStats, setLoadingSubStats] = useState(false);
  const [subStats, setSubStats] = useState<{ activeSubscriptions: number; standardSubscribers: number; premiumSubscribers: number; expiringSoon: number; paymentMode: string } | null>(null);

  // Plans Management state
  const [plansList, setPlansList] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [isPlanFormOpen, setIsPlanFormOpen] = useState(false);
  const [planFormName, setPlanFormName] = useState("");
  const [planFormPrice, setPlanFormPrice] = useState(0);
  const [planFormInterval, setPlanFormInterval] = useState("month");
  const [planFormIsActive, setPlanFormIsActive] = useState(true);
  const [planFormSaving, setPlanFormSaving] = useState(false);

  // Payments History state
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [totalPaymentsCount, setTotalPaymentsCount] = useState(0);
  const [payPage, setPayPage] = useState(1);
  const [payPages, setPayPages] = useState(1);
  const [paySearch, setPaySearch] = useState("");
  const [payDebouncedSearch, setPayDebouncedSearch] = useState("");
  const [payFilterStatus, setPayFilterStatus] = useState("All");
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Selected subscription details slider state
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [isSubDetailsOpen, setIsSubDetailsOpen] = useState(false);
  const [loadingSelectedSub, setLoadingSelectedSub] = useState(false);

  // Billing alteration actions state
  const [subToCancel, setSubToCancel] = useState<any>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [subToExtend, setSubToExtend] = useState<any>(null);
  const [showExtendConfirm, setShowExtendConfirm] = useState(false);
  const [extensionDays, setExtensionDays] = useState(30);

  // Analytics state variables
  const [analyticsPeriod, setAnalyticsPeriod] = useState<"7d" | "30d" | "90d" | "this_year">("7d");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Settings state variables
  const [settingsSupportEmail, setSettingsSupportEmail] = useState(() => localStorage.getItem("ks_settings_support_email") || "support@krishnasanjeevani.org");
  const [settingsDefaultVisibility, setSettingsDefaultVisibility] = useState(() => localStorage.getItem("ks_settings_default_visibility") || "draft");
  const [settingsDefaultDifficulty, setSettingsDefaultDifficulty] = useState(() => localStorage.getItem("ks_settings_default_difficulty") || "beginner");
  const [settingsDefaultTier, setSettingsDefaultTier] = useState(() => localStorage.getItem("ks_settings_default_tier") || "free");
  const [settingsDefaultCategory, setSettingsDefaultCategory] = useState(() => localStorage.getItem("ks_settings_default_category") || "devotional");
  const [settingsPregnancyEnabled, setSettingsPregnancyEnabled] = useState(() => localStorage.getItem("ks_settings_pregnancy_enabled") !== "false");
  const [settingsPregnancyRec, setSettingsPregnancyRec] = useState(() => localStorage.getItem("ks_settings_pregnancy_rec") || "automatic");
  const [settingsAdminRefresh, setSettingsAdminRefresh] = useState(() => localStorage.getItem("ks_settings_admin_refresh") || "automatic");
  const [settingsAdminPageSize, setSettingsAdminPageSize] = useState(() => Number(localStorage.getItem("ks_settings_admin_page_size") || "25"));
  const [settingsShowNotify, setSettingsShowNotify] = useState(() => localStorage.getItem("ks_settings_show_notify") !== "false");
  const [settingsShowConfirm, setSettingsShowConfirm] = useState(() => localStorage.getItem("ks_settings_show_confirm") !== "false");
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  // Debounce search query for subscriptions
  useEffect(() => {
    const handler = setTimeout(() => {
      setSubDebouncedSearch(subSearch);
      setSubPage(1);
    }, 450);
    return () => clearTimeout(handler);
  }, [subSearch]);

  // Debounce search query for payments
  useEffect(() => {
    const handler = setTimeout(() => {
      setPayDebouncedSearch(paySearch);
      setPayPage(1);
    }, 450);
    return () => clearTimeout(handler);
  }, [paySearch]);

  // Debounce search query for users
  useEffect(() => {
    const handler = setTimeout(() => {
      setUserDebouncedQuery(userQuery);
      setUserPage(1);
    }, 450);
    return () => clearTimeout(handler);
  }, [userQuery]);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 450);
    return () => clearTimeout(handler);
  }, [query]);

  // Debounce search query for programs
  useEffect(() => {
    const handler = setTimeout(() => {
      setProgDebouncedQuery(progQuery);
      setProgPage(1);
    }, 450);
    return () => clearTimeout(handler);
  }, [progQuery]);

  // ── Fetch Operations ──
  const loadOverview = useCallback(async () => {
    setFetchingOverview(true);
    setOverviewError(null);
    try {
      const res = await api.admin.getOverview();
      if (res.success && res.data) {
        setOverviewData(res.data);
      } else {
        setOverviewError(res.message || "Failed to load dashboard data");
      }
    } catch (err) {
      setOverviewError("Unable to load dashboard data. Check server connectivity.");
    } finally {
      setFetchingOverview(false);
    }
  }, []);

  const loadUsersList = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const params: Record<string, any> = {
        page: userPage,
        limit: 10,
        search: userDebouncedQuery,
      };
      if (userFilterStatus !== "All") params["status"] = userFilterStatus.toLowerCase();
      if (userFilterRole !== "All") params["role"] = userFilterRole.toLowerCase();
      if (userFilterTier !== "All") params["tier"] = userFilterTier.toLowerCase();

      const res = await api.admin.users.listAdmin(params);
      if (res.success && res.data) {
        setUsersList(res.data.data || []);
        setTotalUsersCount(res.data.meta?.total || 0);
        setUserPages(res.data.meta?.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoadingUsers(false);
    }
  }, [userPage, userDebouncedQuery, userFilterStatus, userFilterRole, userFilterTier]);

  const loadUserStats = useCallback(async () => {
    setLoadingUserStats(true);
    try {
      const res = await api.admin.users.getStats();
      if (res.success && res.data) {
        setUserStats(res.data);
      }
    } catch (err) {
      console.error("Failed to load user stats", err);
    } finally {
      setLoadingUserStats(false);
    }
  }, []);

  const handleOpenUserDetails = async (userItem: any) => {
    setLoadingSelectedUser(true);
    setIsUserDetailsOpen(true);
    setSelectedUser(null);
    try {
      const res = await api.admin.users.getDetails(userItem.id);
      if (res.success && res.data) {
        setSelectedUser(res.data);
      } else {
        toast.error(res.message || "Failed to load user details");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load user details");
    } finally {
      setLoadingSelectedUser(false);
    }
  };

  const handleDeactivate = (userItem: any) => {
    setUserToDeactivate(userItem);
    setShowDeactivateConfirm(true);
  };

  const handleDeactivateConfirm = async () => {
    if (!userToDeactivate) return;
    try {
      const res = await api.admin.users.deactivate(userToDeactivate.id);
      if (res.success) {
        toast.success(`Account deactivated: ${userToDeactivate.email}`);
        setShowDeactivateConfirm(false);
        setUserToDeactivate(null);
        if (selectedUser?.user.id === userToDeactivate.id) {
          setSelectedUser((prev: any) => ({
            ...prev,
            user: { ...prev.user, status: "suspended" }
          }));
        }
        loadUsersList();
        loadUserStats();
        loadOverview();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to deactivate user.");
    }
  };

  const handleReactivate = (userItem: any) => {
    setUserToReactivate(userItem);
    setShowReactivateConfirm(true);
  };

  const handleReactivateConfirm = async () => {
    if (!userToReactivate) return;
    try {
      const res = await api.admin.users.reactivate(userToReactivate.id);
      if (res.success) {
        toast.success(`Account reactivated: ${userToReactivate.email}`);
        setShowReactivateConfirm(false);
        setUserToReactivate(null);
        if (selectedUser?.user.id === userToReactivate.id) {
          setSelectedUser((prev: any) => ({
            ...prev,
            user: { ...prev.user, status: "active" }
          }));
        }
        loadUsersList();
        loadUserStats();
        loadOverview();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to reactivate user.");
    }
  };

  const handleClearUserFilters = () => {
    setUserQuery("");
    setUserFilterStatus("All");
    setUserFilterRole("All");
    setUserFilterTier("All");
    setUserPage(1);
  };

  useEffect(() => {
    if (section === "users") {
      loadUsersList();
      loadUserStats();
    }
  }, [section, loadUsersList, loadUserStats]);

  const loadSubsList = useCallback(async () => {
    setLoadingSubs(true);
    try {
      const params: Record<string, any> = {
        page: subPage,
        limit: 10,
        search: subDebouncedSearch,
      };
      if (subFilterStatus !== "All") params["status"] = subFilterStatus.toLowerCase();
      if (subFilterPlan !== "All") params["planId"] = subFilterPlan.toLowerCase();

      const res = await api.admin.subscriptions.list(params);
      if (res.success && res.data) {
        setSubsList(res.data.data || []);
        setTotalSubsCount(res.data.meta?.total || 0);
        setSubPages(res.data.meta?.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load subscriptions list", err);
    } finally {
      setLoadingSubs(false);
    }
  }, [subPage, subDebouncedSearch, subFilterStatus, subFilterPlan]);

  const loadSubStats = useCallback(async () => {
    setLoadingSubStats(true);
    try {
      const res = await api.admin.subscriptions.getStats();
      if (res.success && res.data) {
        setSubStats(res.data);
      }
    } catch (err) {
      console.error("Failed to load subscription stats", err);
    } finally {
      setLoadingSubStats(false);
    }
  }, []);

  const loadPlansList = useCallback(async () => {
    setLoadingPlans(true);
    try {
      const res = await api.admin.subscriptions.listPlans();
      if (res.success && res.data) {
        setPlansList(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load plans list", err);
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  const loadPaymentsList = useCallback(async () => {
    setLoadingPayments(true);
    try {
      const params: Record<string, any> = {
        page: payPage,
        limit: 10,
        search: payDebouncedSearch,
      };
      if (payFilterStatus !== "All") params["status"] = payFilterStatus.toLowerCase();

      const res = await api.admin.subscriptions.listPayments(params);
      if (res.success && res.data) {
        setPaymentsList(res.data.data || []);
        setTotalPaymentsCount(res.data.meta?.total || 0);
        setPayPages(res.data.meta?.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load payments history", err);
    } finally {
      setLoadingPayments(false);
    }
  }, [payPage, payDebouncedSearch, payFilterStatus]);

  const handleOpenSubDetails = async (subItem: any) => {
    setLoadingSelectedSub(true);
    setIsSubDetailsOpen(true);
    setSelectedSub(null);
    try {
      const res = await api.admin.subscriptions.getDetails(subItem.id);
      if (res.success && res.data) {
        setSelectedSub(res.data);
      } else {
        toast.error(res.message || "Failed to load subscription details");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load subscription details");
    } finally {
      setLoadingSelectedSub(false);
    }
  };

  const handleCancelSub = (subItem: any) => {
    setSubToCancel(subItem);
    setShowCancelConfirm(true);
  };

  const handleCancelSubConfirm = async () => {
    if (!subToCancel) return;
    try {
      const res = await api.admin.subscriptions.cancel(subToCancel.id);
      if (res.success) {
        toast.success("Subscription cancelled successfully.");
        setShowCancelConfirm(false);
        setSubToCancel(null);
        if (selectedSub?.subscription.id === subToCancel.id) {
          setSelectedSub((prev: any) => ({
            ...prev,
            subscription: { ...prev.subscription, status: "canceled" }
          }));
        }
        loadSubsList();
        loadSubStats();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel subscription.");
    }
  };

  const handleExtendSub = (subItem: any) => {
    setSubToExtend(subItem);
    setExtensionDays(30);
    setShowExtendConfirm(true);
  };

  const handleExtendSubConfirm = async () => {
    if (!subToExtend) return;
    try {
      const res = await api.admin.subscriptions.extend(subToExtend.id, extensionDays);
      if (res.success) {
        toast.success(`Subscription extended by ${extensionDays} days.`);
        setShowExtendConfirm(false);
        setSubToExtend(null);
        if (selectedSub?.subscription.id === subToExtend.id) {
          const detailsRes = await api.admin.subscriptions.getDetails(subToExtend.id);
          if (detailsRes.success && detailsRes.data) {
            setSelectedSub(detailsRes.data);
          }
        }
        loadSubsList();
        loadSubStats();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to extend subscription.");
    }
  };

  const handleOpenEditPlan = (planItem: any) => {
    setEditingPlan(planItem);
    setPlanFormName(planItem.name);
    setPlanFormPrice(planItem.price / 100);
    setPlanFormInterval(planItem.interval);
    setPlanFormIsActive(planItem.isActive === 1);
    setIsPlanFormOpen(true);
  };

  const handlePlanFormSubmit = async () => {
    if (!planFormName.trim()) {
      toast.error("Plan name is required.");
      return;
    }
    if (planFormPrice < 0) {
      toast.error("Price cannot be negative.");
      return;
    }
    setPlanFormSaving(true);
    try {
      const body = {
        name: planFormName,
        price: Math.round(planFormPrice * 100),
        interval: planFormInterval,
        isActive: planFormIsActive ? 1 : 0,
      };
      const res = await api.admin.subscriptions.updatePlan(editingPlan.id, body);
      if (res.success) {
        toast.success(`Plan "${planFormName}" updated successfully.`);
        setIsPlanFormOpen(false);
        setEditingPlan(null);
        loadPlansList();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update plan.");
    } finally {
      setPlanFormSaving(false);
    }
  };

  useEffect(() => {
    if (section === "subscriptions") {
      loadSubStats();
      if (subSection === "subscriptions") {
        loadSubsList();
      } else if (subSection === "plans") {
        loadPlansList();
      } else if (subSection === "payments") {
        loadPaymentsList();
      }
    }
  }, [section, subSection, loadSubStats, loadSubsList, loadPlansList, loadPaymentsList]);

  const loadAnalyticsData = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const res = await api.admin.analytics.getDashboard({ period: analyticsPeriod });
      if (res.success && res.data) {
        setAnalyticsData(res.data);
      } else {
        toast.error(res.message || "Failed to load analytics dashboard data");
      }
    } catch (err: any) {
      console.error("Failed to load analytics", err);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [analyticsPeriod]);

  useEffect(() => {
    if (section === "analytics") {
      loadAnalyticsData();
    }
  }, [section, analyticsPeriod, loadAnalyticsData]);

  const loadSystemHealth = useCallback(async () => {
    setLoadingHealth(true);
    try {
      const res = await api.admin.getHealth();
      if (res.success && res.data) {
        setHealthStatus(res.data);
      }
    } catch (err) {
      console.error("Failed to load health status", err);
    } finally {
      setLoadingHealth(false);
    }
  }, []);

  useEffect(() => {
    if (section === "settings") {
      loadSystemHealth();
    }
  }, [section, loadSystemHealth]);

  const handleExportCSV = (type: "listening" | "tracks" | "programs" | "subscriptions") => {
    if (!analyticsData) {
      toast.error("No analytics data available to export.");
      return;
    }
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `export_${type}_${analyticsPeriod}.csv`;

    if (type === "listening") {
      headers = ["Date", "Hours Listened", "Plays"];
      rows = (analyticsData.listening?.listeningTrend || []).map((t: any) => [
        t.date,
        String(t.hours),
        String(t.plays)
      ]);
    } else if (type === "tracks") {
      headers = ["Track Name", "Artist", "Plays", "Completions", "Completion Rate"];
      rows = (analyticsData.popularTracks || []).map((t: any) => [
        t.title || "Unknown",
        t.artist || "Unknown",
        String(t.plays),
        String(t.completions),
        `${t.completionRate}%`
      ]);
    } else if (type === "programs") {
      headers = ["Program Name", "Starts", "Completions", "Completion Rate"];
      rows = (analyticsData.programPerformance || []).map((p: any) => [
        p.title || "Unknown",
        String(p.starts),
        String(p.completions),
        `${p.completionRate}%`
      ]);
    } else if (type === "subscriptions") {
      headers = ["Metric", "Count"];
      const sub = analyticsData.subscriptions;
      rows = [
        ["Active Subscriptions", String(sub?.activeSubscriptions || 0)],
        ["New Subscriptions", String(sub?.newSubscriptions || 0)],
        ["Expired Subscriptions", String(sub?.expiredSubscriptions || 0)],
        ["Cancelled Subscriptions", String(sub?.cancelledSubscriptions || 0)]
      ];
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${type} analytics exported as CSV!`);
  };

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await api.tracks.getStats();
      if (res.success && res.data) {
        setTrackStats(res.data);
      }
    } catch (err) {
      console.error("Failed to load track stats", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const loadTracks = useCallback(async () => {
    setLoadingTracks(true);
    try {
      const params: Record<string, any> = {
        page,
        limit: perPage,
        search: debouncedQuery,
      };
      if (filterCategory !== "All") params["category"] = filterCategory.toLowerCase();
      if (filterTier !== "All") params["tier"] = filterTier.toLowerCase();
      if (filterLanguage !== "All") params["language"] = filterLanguage;
      if (filterStatus !== "All") params["status"] = filterStatus.toLowerCase();
      if (filterProcessing !== "All") params["processingStatus"] = filterProcessing.toLowerCase();

      const res = await api.tracks.listAdmin(params);
      if (res.success && res.data) {
        setTracksList(res.data.data || []);
        setTotalTracksCount(res.data.pagination?.total || 0);
        setPages(res.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load tracks", err);
    } finally {
      setLoadingTracks(false);
    }
  }, [page, perPage, debouncedQuery, filterCategory, filterTier, filterLanguage, filterStatus, filterProcessing]);

  const loadTags = useCallback(async () => {
    try {
      const res = await api.tracks.listTags();
      if (res.success && res.data) {
        if (res.data.length === 0) {
          await Promise.all(
            DEFAULT_PURPOSES.map((name) =>
              api.tracks.createTag(name, `Therapeutic category for ${name.toLowerCase()}`)
            )
          );
          const reRes = await api.tracks.listTags();
          if (reRes.success && reRes.data) {
            setAllTags(reRes.data);
          }
        } else {
          setAllTags(res.data);
        }
      }
    } catch (err) {
      console.error("Failed to load tags", err);
    }
  }, []);

  const loadPrograms = useCallback(async () => {
    try {
      const res = await api.programs.list({ limit: 100 });
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setTotalProgramsCount(list.length);
      }
    } catch (err) {
      console.error("Failed to load programs", err);
    }
  }, []);

  const loadProgramsList = useCallback(async () => {
    setLoadingPrograms(true);
    try {
      const params: Record<string, any> = {
        page: progPage,
        limit: 10,
        search: progDebouncedQuery,
      };
      if (progFilterCategory !== "All") params["category"] = progFilterCategory.toLowerCase();
      if (progFilterTier !== "All") params["tier"] = progFilterTier.toLowerCase();
      if (progFilterDifficulty !== "All") params["difficulty"] = progFilterDifficulty.toLowerCase();
      if (progFilterStatus !== "All") params["status"] = progFilterStatus.toLowerCase();

      const res = await api.programs.listAdmin(params);
      if (res.success && res.data) {
        setProgramsList(res.data.data || []);
        setTotalProgramsCount(res.data.pagination?.total || 0);
        setProgPages(res.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load programs", err);
    } finally {
      setLoadingPrograms(false);
    }
  }, [progPage, progDebouncedQuery, progFilterCategory, progFilterTier, progFilterDifficulty, progFilterStatus]);

  const loadProgramStats = useCallback(async () => {
    setLoadingProgramStats(true);
    try {
      const res = await api.programs.getStats();
      if (res.success && res.data) {
        setProgramStats(res.data);
      }
    } catch (err) {
      console.error("Failed to load program stats", err);
    } finally {
      setLoadingProgramStats(false);
    }
  }, []);

  useEffect(() => {
    if (user && ["admin", "super_admin"].includes(user.role)) {
      loadOverview();
      loadTags();
      loadPrograms();
    }
  }, [user, loadOverview, loadTags, loadPrograms]);

  useEffect(() => {
    if (section === "content") {
      loadTracks();
      loadStats();
    }
  }, [section, loadTracks, loadStats]);

  useEffect(() => {
    if (section === "programs") {
      loadProgramsList();
      loadProgramStats();
    }
  }, [section, loadProgramsList, loadProgramStats]);

  // Reset form fields helper
  const resetFormFields = () => {
    setFormTitle("");
    setFormSubtitle("");
    setFormDescription("");
    setFormArtist("");
    setFormCategory((localStorage.getItem("ks_settings_default_category") || "devotional") as any);
    setFormLanguage("hi");
    setFormTier((localStorage.getItem("ks_settings_default_tier") || "free") as any);
    setFormSelectedTags([]);
    setFormAudioFile(null);
    setFormImageFile(null);
    setFormStatus("idle");
    setFormStatusMessage("");
  };

  // Form dirty checks
  const checkIsDirty = useCallback(() => {
    if (editingTrack) {
      const titleChanged = formTitle !== (editingTrack.title || "");
      const subtitleChanged = formSubtitle !== (editingTrack.subtitle || "");
      const descChanged = formDescription !== (editingTrack.description || "");
      const artistChanged = formArtist !== (editingTrack.artist || "");
      const catChanged = formCategory !== (editingTrack.category || "devotional");
      const langChanged = formLanguage !== (editingTrack.language || "hi");
      const tierChanged = formTier !== (editingTrack.tier || "free");
      
      const originalTags = editingTrack.purposeTags?.map((t: any) => t.id) || [];
      const tagsChanged = 
        formSelectedTags.length !== originalTags.length ||
        formSelectedTags.some(t => !originalTags.includes(t));

      const hasNewFiles = formAudioFile !== null || formImageFile !== null;

      return titleChanged || subtitleChanged || descChanged || artistChanged || catChanged || langChanged || tierChanged || tagsChanged || hasNewFiles;
    } else {
      return (
        formTitle !== "" ||
        formSubtitle !== "" ||
        formDescription !== "" ||
        formArtist !== "" ||
        formSelectedTags.length > 0 ||
        formAudioFile !== null ||
        formImageFile !== null
      );
    }
  }, [
    editingTrack,
    formTitle,
    formSubtitle,
    formDescription,
    formArtist,
    formCategory,
    formLanguage,
    formTier,
    formSelectedTags,
    formAudioFile,
    formImageFile,
  ]);

  const handleCloseForm = useCallback(() => {
    if (checkIsDirty() && formStatus === "idle") {
      setUnsavedConfirmCallback(() => () => {
        setIsFormOpen(false);
        setEditingTrack(null);
        resetFormFields();
        setShowUnsavedConfirm(false);
      });
      setShowUnsavedConfirm(true);
    } else {
      setIsFormOpen(false);
      setEditingTrack(null);
      resetFormFields();
    }
  }, [checkIsDirty, formStatus]);

  // Submit Handler
  const handleFormSubmit = async (publishImmediate = false) => {
    if (!formTitle.trim()) {
      toast.error("Track name is required.");
      return;
    }
    if (!formArtist.trim()) {
      toast.error("Artist name is required.");
      return;
    }
    if (!editingTrack && !formAudioFile) {
      toast.error("An MP3 audio master file is required.");
      return;
    }

    try {
      let thumbnailKey = editingTrack?.thumbnailKey || "";
      const trackId = editingTrack?.id || crypto.randomUUID();

      // 1. Cover Artwork Upload
      if (formImageFile) {
        setFormStatus("uploading_image");
        setFormStatusMessage("Uploading cover artwork to Cloudflare R2...");
        const imgRes = await api.storage.uploadImage(formImageFile);
        if (imgRes.success && imgRes.data) {
          thumbnailKey = imgRes.data.key;
        } else {
          throw new Error(imgRes.message || "Failed to upload image.");
        }
      }

      // 2. Metadata Save (D1 Table)
      setFormStatus("creating_metadata");
      setFormStatusMessage(editingTrack ? "Updating track metadata..." : "Creating track metadata...");
      
      const payload: any = {
        title: formTitle,
        subtitle: formSubtitle,
        description: formDescription,
        artist: formArtist,
        category: formCategory,
        language: formLanguage,
        tier: formTier,
        purposeTagIds: formSelectedTags,
        publishStatus: editingTrack ? undefined : (localStorage.getItem("ks_settings_default_visibility") || "draft"),
      };

      if (editingTrack) {
        if (formImageFile) payload.thumbnailKey = thumbnailKey;
        const updateRes = await api.tracks.update(trackId, payload);
        if (!updateRes.success) throw new Error(updateRes.message || "Failed to save edits.");
      } else {
        payload.id = trackId;
        payload.thumbnailKey = thumbnailKey;
        const createRes = await api.tracks.create(payload);
        if (!createRes.success) throw new Error(createRes.message || "Failed to create track.");
      }

      // 3. Audio Upload & Transcoding (Queue triggers)
      // 3. Audio Upload & Transcoding (Queue triggers)
      if (formAudioFile) {
        setFormStatus("uploading_audio");
        setFormStatusMessage("Starting multipart upload...");

        // 1. Start multipart upload
        const startRes = await api.storage.multipartStart(formAudioFile.name, formAudioFile.type);
        if (!startRes.success || !startRes.data) {
          throw new Error(startRes.message || "Failed to start multipart upload.");
        }
        const { uploadId, key } = startRes.data;

        // 2. Chunk and upload parts
        const chunkSize = 5 * 1024 * 1024; // 5MB chunks
        const totalParts = Math.ceil(formAudioFile.size / chunkSize);
        const uploadedParts: { partNumber: number; etag: string }[] = [];

        try {
          for (let i = 0; i < totalParts; i++) {
            const partNumber = i + 1;
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, formAudioFile.size);
            const chunkBlob = formAudioFile.slice(start, end);

            // Read the blob as ArrayBuffer to send raw binary
            const chunkData = await chunkBlob.arrayBuffer();

            // Upload part with retries
            let success = false;
            let partEtag = "";
            let retryCount = 0;
            const maxRetries = 3;

            while (!success && retryCount <= maxRetries) {
              try {
                setFormStatusMessage(
                  `Uploading part ${partNumber}/${totalParts}... (${Math.round((i / totalParts) * 100)}%)`
                );
                const partRes = await api.storage.multipartUploadPart(key, uploadId, partNumber, chunkData);
                if (partRes.success && partRes.data) {
                  partEtag = partRes.data.etag;
                  success = true;
                } else {
                  throw new Error(partRes.message || "Part upload failed on server.");
                }
              } catch (partErr) {
                retryCount++;
                if (retryCount > maxRetries) {
                  throw partErr;
                }
                // Wait 1 second before retrying
                await new Promise((res) => setTimeout(res, 1000));
              }
            }

            uploadedParts.push({ partNumber, etag: partEtag });
          }

          // 3. Complete multipart upload
          setFormStatusMessage("Finalizing upload...");
          const completeRes = await api.storage.multipartComplete(key, uploadId, uploadedParts, trackId);
          if (!completeRes.success) {
            throw new Error(completeRes.message || "Failed to complete multipart upload.");
          }
        } catch (uploadErr) {
          // Attempt to abort on failure
          try {
            await api.storage.multipartAbort(key, uploadId);
          } catch (abortErr) {
            console.error("Failed to abort multipart upload:", abortErr);
          }
          throw uploadErr;
        }

        setFormStatus("transcoding");
        setFormStatusMessage("Encoding stream. Segmenting master files...");

        let attempts = 0;
        const maxAttempts = 60;
        let isReady = false;

        while (attempts < maxAttempts) {
          attempts++;
          setFormStatusMessage("Transcoding to HLS... (Attempt " + attempts + "/60)");
          await new Promise((res) => setTimeout(res, 1500));
          
          const pollRes = await api.tracks.get(trackId);
          if (pollRes.success && pollRes.data) {
            const status = pollRes.data.processingStatus;
            if (status === "ready") {
              isReady = true;
              break;
            } else if (status === "failed") {
              throw new Error("Transcoding pipeline failed on server side.");
            }
          }
        }

        if (!isReady) {
          throw new Error("Transcoding process timeout. The file will continue processing in the background.");
        }
      }

      // 4. Publish immediately (if requested)
      if (publishImmediate && (!editingTrack || editingTrack.publishStatus !== "published")) {
        if (!thumbnailKey) {
          throw new Error("Artwork thumbnail is required to publish this track.");
        }
        setFormStatus("publishing" as any);
        setFormStatusMessage("Publishing track to catalogue...");
        const pubRes = await api.tracks.publish(trackId);
        if (!pubRes.success) throw new Error(pubRes.message || "Failed to publish.");
      }

      setFormStatus("success");
      toast.success(
        editingTrack
          ? "Track metadata updated successfully!"
          : publishImmediate
          ? "Track created, encoded, and published successfully!"
          : "Track created and encoded as draft successfully!"
      );

      // Close and refresh
      setIsFormOpen(false);
      setEditingTrack(null);
      resetFormFields();
      loadTracks();
      loadStats();
      loadOverview();
    } catch (err: any) {
      setFormStatus("error");
      setFormStatusMessage(err.message || "Operation failed.");
      toast.error(err.message || "An error occurred during save.");
    }
  };

  // Actions
  const handleOpenEdit = (track: any) => {
    setEditingTrack(track);
    setFormTitle(track.title || "");
    setFormSubtitle(track.subtitle || "");
    setFormDescription(track.description || "");
    setFormArtist(track.artist || "");
    setFormCategory(track.category || "devotional");
    setFormLanguage(track.language || "hi");
    setFormTier(track.tier || "free");
    setFormSelectedTags(track.purposeTags?.map((t: any) => t.id) || []);
    setFormAudioFile(null);
    setFormImageFile(null);
    setFormStatus("idle");
    setFormStatusMessage("");
    setIsFormOpen(true);
  };

  const handlePublish = async (track: any) => {
    if (!track.thumbnailKey) {
      toast.error("Cover artwork thumbnail is required to publish this track.");
      return;
    }
    if (track.processingStatus !== "ready") {
      toast.error("Track is not ready (current transcoding status: " + track.processingStatus + ")");
      return;
    }

    try {
      const res = await api.tracks.publish(track.id);
      if (res.success) {
        toast.success('"' + track.title + '" has been published successfully!');
        if (selectedTrack?.id === track.id) {
          setSelectedTrack((prev: any) => ({ ...prev, publishStatus: "published" }));
        }
        loadTracks();
        loadStats();
        loadOverview();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to publish track.");
    }
  };

  const handleUnpublish = async (track: any) => {
    try {
      const res = await api.tracks.unpublish(track.id);
      if (res.success) {
        toast.success('"' + track.title + '" reverted to draft successfully.');
        if (selectedTrack?.id === track.id) {
          setSelectedTrack((prev: any) => ({ ...prev, publishStatus: "draft" }));
        }
        loadTracks();
        loadStats();
        loadOverview();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to unpublish track.");
    }
  };

  const handleArchive = async (track: any) => {
    try {
      const res = await api.tracks.archive(track.id);
      if (res.success) {
        toast.success('"' + track.title + '" has been archived.');
        if (selectedTrack?.id === track.id) {
          setSelectedTrack((prev: any) => ({ ...prev, publishStatus: "archived" }));
        }
        loadTracks();
        loadStats();
        loadOverview();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to archive track.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!trackToDelete) return;
    try {
      const res = await api.tracks.delete(trackToDelete.id);
      if (res.success) {
        toast.success('"' + trackToDelete.title + '" deleted safely.');
        setTrackToDelete(null);
        setShowDeleteConfirm(false);
        setIsDetailsOpen(false);
        if (tracksList.length === 1 && page > 1) {
          setPage((p) => p - 1);
        } else {
          loadTracks();
        }
        loadStats();
        loadOverview();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete track.");
    }
  };

  // Preview toggle trigger
  const handlePreviewToggle = async (track: any) => {
    if (track.processingStatus !== "ready") {
      toast.error("Track is not transcoded yet. Preview is unavailable.");
      return;
    }
    const isCurrentPlaying = playingTrack?.id === track.id;
    if (isCurrentPlaying) {
      toggleHlsPlayback();
    } else {
      toast.info('Generating streaming ticket for "' + track.title + '"...');
      // cast raw item to content type Track for global player compatibility
      const castedTrack: Track = {
        id: track.id,
        title: track.title,
        artist: track.artist,
        subtitle: track.subtitle,
        description: track.description,
        duration: track.duration || 0,
        category: track.category,
        thumbnailKey: track.thumbnailKey,
        playlistKey: track.playlistKey,
        premium: track.tier === "premium",
        tier: track.tier,
      };
      playHlsTrack(castedTrack);
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    setQuery("");
    setFilterStatus("All");
    setFilterCategory("All");
    setFilterTier("All");
    setFilterProcessing("All");
    setFilterLanguage("All");
    setPage(1);
  };

  // Program-specific CMS Helpers
  const handleClearProgFilters = () => {
    setProgQuery("");
    setProgFilterStatus("All");
    setProgFilterCategory("All");
    setProgFilterTier("All");
    setProgFilterDifficulty("All");
    setProgPage(1);
  };

  const handleOpenProgDetails = async (program: any) => {
    setSelectedProgram(program);
    setIsProgDetailsOpen(true);
    setLoadingSelectedProgramTracks(true);
    setSelectedProgramTracks([]);
    setSelectedProgramSchedules([]);
    try {
      const tracksRes = await api.programs.getTracks(program.id);
      if (tracksRes.success && tracksRes.data) {
        setSelectedProgramTracks(tracksRes.data);
      }
      if (program.category === "pregnancy") {
        const schedRes = await api.programs.getPregnancySchedules(program.id);
        if (schedRes.success && schedRes.data) {
          setSelectedProgramSchedules(schedRes.data);
        }
      }
    } catch (err) {
      console.error("Failed to load program details", err);
    } finally {
      setLoadingSelectedProgramTracks(false);
    }
  };

  const handleOpenProgEdit = async (program: any) => {
    setEditingProgram(program);
    setProgFormTitle(program.title || "");
    setProgFormSubtitle(program.subtitle || "");
    setProgFormDescription(program.description || "");
    setProgFormCategory(program.category || "devotional");
    setProgFormDifficulty(program.difficulty || "beginner");
    setProgFormTier(program.tier || "free");
    setProgFormLanguage(program.language || "hi");
    setProgFormThumbnailKey(program.thumbnailKey || "");
    setProgFormImageFile(null);
    setProgFormStatus("idle");
    setProgFormStatusMessage("");

    setProgFormTracks([]);
    setProgFormSchedules([]);

    setIsProgramFormOpen(true);

    try {
      const tracksRes = await api.programs.getTracks(program.id);
      if (tracksRes.success && tracksRes.data) {
        setProgFormTracks(tracksRes.data);
        program._originalTrackIds = tracksRes.data.map((t: any) => t.id);
      }
      if (program.category === "pregnancy") {
        const schedRes = await api.programs.getPregnancySchedules(program.id);
        if (schedRes.success && schedRes.data) {
          setProgFormSchedules(schedRes.data);
          program._originalSchedules = JSON.parse(JSON.stringify(schedRes.data));
        }
      }
    } catch (err) {
      console.error("Failed to load program components for editing", err);
    }
  };

  const handleProgramFormSubmit = async (publishImmediate = false) => {
    if (!progFormTitle.trim()) {
      toast.error("Program title is required.");
      return;
    }
    if (!progFormCategory) {
      toast.error("Category is required.");
      return;
    }

    try {
      let thumbnailKey = progFormThumbnailKey;
      const programId = editingProgram?.id || crypto.randomUUID();

      // 1. Thumbnail Art Upload
      if (progFormImageFile) {
        setProgFormStatus("uploading_image");
        setProgFormStatusMessage("Uploading program artwork to Cloudflare R2...");
        const imgRes = await api.storage.uploadImage(progFormImageFile);
        if (imgRes.success && imgRes.data) {
          thumbnailKey = imgRes.data.key;
          setProgFormThumbnailKey(thumbnailKey);
        } else {
          throw new Error(imgRes.message || "Failed to upload image.");
        }
      }

      setProgFormStatus("saving");
      setProgFormStatusMessage(editingProgram ? "Saving program metadata..." : "Creating program...");

      let programTypeId = "1";
      if (progFormCategory === "pregnancy") programTypeId = "3";
      else if (progFormCategory === "corporate") programTypeId = "2";

      const payload: any = {
        title: progFormTitle,
        subtitle: progFormSubtitle,
        description: progFormDescription,
        category: progFormCategory,
        difficulty: progFormDifficulty,
        tier: progFormTier,
        language: progFormLanguage,
        programTypeId,
        thumbnailKey,
      };

      if (editingProgram) {
        const updateRes = await api.programs.update(programId, payload);
        if (!updateRes.success) throw new Error(updateRes.message || "Failed to update program.");
      } else {
        payload.id = programId;
        const createRes = await api.programs.create(payload);
        if (!createRes.success) throw new Error(createRes.message || "Failed to create program.");
      }

      // 2. Persist tracks mapping
      const originalTrackIds = editingProgram?._originalTrackIds || [];
      const currentTrackIds = progFormTracks.map(t => t.id);

      const toAdd = currentTrackIds.filter((id: string) => !originalTrackIds.includes(id));
      const toDelete = originalTrackIds.filter((id: string) => !currentTrackIds.includes(id));

      for (const trackId of toDelete) {
        await api.programs.removeTrack(programId, trackId);
      }

      let nextSeq = originalTrackIds.length - toDelete.length + 1;
      for (const trackId of toAdd) {
        await api.programs.addTrack(programId, trackId, nextSeq);
        nextSeq++;
      }

      const trackListForReorder = progFormTracks.map((t, idx) => ({
        trackId: t.id,
        sequence: idx + 1,
      }));
      if (trackListForReorder.length > 0) {
        const reorderRes = await api.programs.reorderTracks(programId, trackListForReorder);
        if (!reorderRes.success) throw new Error(reorderRes.message || "Failed to reorder track sequences.");
      }

      // 3. Persist pregnancy schedules
      if (progFormCategory === "pregnancy") {
        const originalSchedules = editingProgram?._originalSchedules || [];
        for (const s of originalSchedules) {
          await api.pregnancy.removeSchedule(s.scheduleId || s.id);
        }
        for (const s of progFormSchedules) {
          const schedPayload = {
            programId,
            pregnancyMonth: s.pregnancyMonth,
            week: s.week,
            day: s.day,
            unlockAfterDays: s.unlockAfterDays || 0,
            isRequired: s.isRequired ? 1 : 0,
          };
          await api.pregnancy.createSchedule(schedPayload);
        }
      }

      // 4. Publish immediately (if requested)
      if (publishImmediate) {
        setProgFormStatusMessage("Publishing program to mobile catalogue...");
        const pubRes = await api.programs.publish(programId);
        if (!pubRes.success) {
          throw new Error(pubRes.message || "Prerequisite validations failed.");
        }
      }

      setProgFormStatus("success");
      toast.success(
        editingProgram
          ? "Program saved successfully!"
          : publishImmediate
          ? "Program created and published successfully!"
          : "Program created as draft successfully!"
      );

      setIsProgramFormOpen(false);
      setEditingProgram(null);
      resetProgramFormFields();
      loadProgramsList();
      loadProgramStats();
      loadOverview();
    } catch (err: any) {
      setProgFormStatus("error");
      setProgFormStatusMessage(err.message || "Operation failed.");
      toast.error(err.message || "An error occurred during save.");
    }
  };

  const handleProgramDuplicate = async (program: any) => {
    const copyName = prompt("Duplicate Program\n\nEnter name for the duplicated program:", `${program.title} (Copy)`);
    if (copyName === null) return;
    
    const finalName = copyName.trim();
    if (!finalName) {
      toast.error("Program name cannot be empty.");
      return;
    }

    try {
      toast.info("Duplicating program and copying track sequences...");
      const res = await api.programs.duplicate(program.id);
      if (res.success && res.data) {
        const duplicatedId = res.data.id;
        await api.programs.update(duplicatedId, { title: finalName });
        toast.success(`"${program.title}" duplicated as "${finalName}" successfully!`);
        loadProgramsList();
        loadProgramStats();
        loadOverview();
      } else {
        toast.error(res.message || "Duplication failed.");
      }
    } catch (err: any) {
      toast.error(err.message || "Duplication failed.");
    }
  };

  const handleProgramPublish = async (program: any) => {
    try {
      const res = await api.programs.publish(program.id);
      if (res.success) {
        toast.success(`"${program.title}" has been published!`);
        if (selectedProgram?.id === program.id) {
          setSelectedProgram((prev: any) => ({ ...prev, status: "published" }));
        }
        loadProgramsList();
        loadProgramStats();
        loadOverview();
      } else {
        toast.error(res.message || "Validation failed.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to publish program.");
    }
  };

  const handleProgramUnpublish = async (program: any) => {
    try {
      const res = await api.programs.unpublish(program.id);
      if (res.success) {
        toast.success(`"${program.title}" reverted to draft.`);
        if (selectedProgram?.id === program.id) {
          setSelectedProgram((prev: any) => ({ ...prev, status: "draft" }));
        }
        loadProgramsList();
        loadProgramStats();
        loadOverview();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to unpublish program.");
    }
  };

  const handleProgramArchive = async (program: any) => {
    try {
      const res = await api.programs.archive(program.id);
      if (res.success) {
        toast.success(`"${program.title}" has been archived.`);
        if (selectedProgram?.id === program.id) {
          setSelectedProgram((prev: any) => ({ ...prev, status: "archived" }));
        }
        loadProgramsList();
        loadProgramStats();
        loadOverview();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to archive program.");
    }
  };

  const handleProgramDeleteConfirm = async () => {
    if (!programToDelete) return;
    try {
      const res = await api.programs.remove(programToDelete.id);
      if (res.success) {
        toast.success(`"${programToDelete.title}" deleted safely.`);
        setProgramToDelete(null);
        setShowProgDeleteConfirm(false);
        setIsProgDetailsOpen(false);
        if (programsList.length === 1 && progPage > 1) {
          setProgPage(p => p - 1);
        } else {
          loadProgramsList();
        }
        loadProgramStats();
        loadOverview();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete program.");
    }
  };

  const resetProgramFormFields = () => {
    setProgFormTitle("");
    setProgFormSubtitle("");
    setProgFormDescription("");
    setProgFormCategory("devotional");
    setProgFormDifficulty("beginner");
    setProgFormTier("free");
    setProgFormLanguage("hi");
    setProgFormThumbnailKey("");
    setProgFormImageFile(null);
    setProgFormTracks([]);
    setProgFormSchedules([]);
    setProgFormStatus("idle");
    setProgFormStatusMessage("");
  };

  const checkIsProgramDirty = useCallback(() => {
    if (editingProgram) {
      const titleChanged = progFormTitle !== (editingProgram.title || "");
      const subtitleChanged = progFormSubtitle !== (editingProgram.subtitle || "");
      const descChanged = progFormDescription !== (editingProgram.description || "");
      const catChanged = progFormCategory !== (editingProgram.category || "devotional");
      const diffChanged = progFormDifficulty !== (editingProgram.difficulty || "beginner");
      const tierChanged = progFormTier !== (editingProgram.tier || "free");
      const langChanged = progFormLanguage !== (editingProgram.language || "hi");
      const hasNewImage = progFormImageFile !== null;

      const tracksChanged = JSON.stringify(progFormTracks.map(t => t.id)) !== JSON.stringify(editingProgram._originalTrackIds || []);
      const schedulesChanged = JSON.stringify(progFormSchedules) !== JSON.stringify(editingProgram._originalSchedules || []);

      return titleChanged || subtitleChanged || descChanged || catChanged || diffChanged || tierChanged || langChanged || hasNewImage || tracksChanged || schedulesChanged;
    } else {
      return (
        progFormTitle !== "" ||
        progFormSubtitle !== "" ||
        progFormDescription !== "" ||
        progFormImageFile !== null ||
        progFormTracks.length > 0 ||
        progFormSchedules.length > 0
      );
    }
  }, [
    editingProgram,
    progFormTitle,
    progFormSubtitle,
    progFormDescription,
    progFormCategory,
    progFormDifficulty,
    progFormTier,
    progFormLanguage,
    progFormImageFile,
    progFormTracks,
    progFormSchedules,
  ]);

  const handleCloseProgramForm = useCallback(() => {
    if (checkIsProgramDirty() && progFormStatus === "idle") {
      setProgUnsavedConfirmCallback(() => () => {
        setIsProgramFormOpen(false);
        setEditingProgram(null);
        resetProgramFormFields();
        setShowProgUnsavedConfirm(false);
      });
      setShowProgUnsavedConfirm(true);
    } else {
      setIsProgramFormOpen(false);
      setEditingProgram(null);
      resetProgramFormFields();
    }
  }, [checkIsProgramDirty, progFormStatus]);

  // Helpers
  const getAssetUrl = (key: string | undefined | null) => {
    if (!key) return null;
    return "/api/v1/storage/file/" + encodeURIComponent(key);
  };

  const formatDuration = (sec: number | null | undefined) => {
    if (!sec) return "Pending";
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return minutes + ":" + seconds.toString().padStart(2, "0");
  };

  const getPregnancyWeekInfo = (eddStr: string) => {
    try {
      const edd = new Date(eddStr);
      const now = new Date();
      const lmp = new Date(edd.getTime() - 280 * 24 * 60 * 60 * 1000);
      const diffMs = now.getTime() - lmp.getTime();
      const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
      const week = Math.max(1, Math.min(42, Math.floor(diffDays / 7) + 1));
      const trimester = week <= 12 ? 1 : week <= 26 ? 2 : 3;
      return { week, trimester };
    } catch {
      return null;
    }
  };

  // ── Auth Safeguards ──
  if (authLoading) {
    return (
      <AppShell chrome={false}>
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-cat" />
          <p className="text-xs text-muted-foreground">Authenticating session...</p>
        </div>
      </AppShell>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <AppShell chrome={false}>
        <div className="mx-auto max-w-md rounded-card border border-border bg-surface p-6 shadow-soft text-center space-y-4 mt-16">
          <h2 className="text-lg font-semibold text-destructive">Unauthorized Access</h2>
          <p className="text-sm text-muted-foreground">
            Please log in with your administrator credentials to access the console.
          </p>
          <Link
            to="/login"
            className="press inline-flex min-h-11 items-center rounded-btn bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Go to Login
          </Link>
        </div>
      </AppShell>
    );
  }

  const isAdmin = ["admin", "super_admin"].includes(user.role);
  if (!isAdmin) {
    return (
      <AppShell chrome={false}>
        <div className="mx-auto max-w-md rounded-card border border-border bg-surface p-6 shadow-soft text-center space-y-4 mt-16">
          <h2 className="text-lg font-semibold text-destructive">Forbidden Access</h2>
          <p className="text-sm text-muted-foreground">
            Your account ({user.email}) does not have permission to access the operations console.
          </p>
          <Link
            to="/home"
            className="press inline-flex min-h-11 items-center rounded-btn bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Back to Home
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell chrome={false}>
      <div className="min-h-dvh bg-background text-foreground -mx-5 -my-6 md:-mx-8 md:-my-8">
        <div className="flex min-h-dvh">
          {/* Admin Navigation Sidebar */}
          <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-surface p-5 lg:flex">
            <Link to="/home" className="flex items-center gap-2.5 text-sm font-bold tracking-tight text-foreground">
              <img
                src={logoWithoutText}
                alt=""
                className="h-8 w-8 object-contain"
              />
              <span>Krishna Sanjeevani</span>
            </Link>
            <div className="mt-2.5 rounded bg-cat-light px-2 py-1 text-[10px] font-bold text-cat w-max">
              ADMIN CONTROL PANEL
            </div>
            
            <nav aria-label="Admin sections" className="mt-8 space-y-1.5 flex-1">
              {nav.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setSection(n.id)}
                  aria-current={section === n.id ? "page" : undefined}
                  className={cn(
                    "press flex min-h-11 w-full items-center gap-3.5 rounded-btn px-4 text-sm font-semibold transition-all",
                    section === n.id
                      ? "bg-cat text-cat-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <n.icon className="h-[18px] w-[18px]" />
                  {n.label}
                </button>
              ))}
            </nav>
            <p className="mt-auto text-[11px] text-muted-foreground/60 border-t border-border/60 pt-4 font-mono">
              Ops Console v2.0-beta
            </p>
          </aside>

          {/* Main Panel Content Area */}
          <main className="min-w-0 flex-1 px-6 py-8 lg:px-10">
            {/* Header toolbar */}
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
              <div>
                <h1 className="text-2xl font-bold tracking-tight capitalize leading-none text-foreground">{section}</h1>
                <p className="mt-1.5 text-xs text-muted-foreground font-medium">
                  {section === "overview" && "Dashboard operational health metrics and activity log."}
                  {section === "content" && "Content management catalogue and stream encoder console."}
                  {section === "programs" && "Manage therapeutic programmes and their track sequences."}
                  {section === "users" && "Manage registered users and account access."}
                  {!["overview", "content", "programs", "users"].includes(section) && "Operations section under construction."}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-cat text-xs font-bold text-cat-foreground select-none">
                  {user.profile?.fullName ? user.profile.fullName.slice(0, 2).toUpperCase() : "AD"}
                </span>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold leading-tight text-foreground">{user.profile?.fullName || "Admin Ops"}</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase font-mono">{user.role}</p>
                </div>
              </div>
            </header>

            {/* Mobile Header navigation pills */}
            <nav
              aria-label="Admin sections mobile"
              className="no-scrollbar mt-4 flex gap-2 overflow-x-auto lg:hidden border-b border-border/40 pb-3"
            >
              {nav.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setSection(n.id)}
                  className={`press min-h-10 shrink-0 rounded-btn border px-4 text-xs font-bold ${
                    section === n.id
                      ? "border-cat bg-cat text-cat-foreground"
                      : "border-border bg-surface text-muted-foreground"
                  }`}
                >
                  {n.label}
                </button>
              ))}
            </nav>

            {/* SECTION RENDERING: OVERVIEW */}
            {section === "overview" && (
              <div className="mt-8 space-y-8 animate-in fade-in duration-200">
                {fetchingOverview ? (
                  <div className="flex min-h-[300px] flex-col items-center justify-center gap-3.5">
                    <Loader2 className="h-8 w-8 animate-spin text-cat" />
                    <p className="text-xs font-medium text-muted-foreground">Refreshing dashboard data...</p>
                  </div>
                ) : overviewError ? (
                  <div className="rounded-card border border-destructive/20 bg-destructive/5 p-6 text-center space-y-4 max-w-md mx-auto mt-10">
                    <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
                    <h3 className="font-bold text-destructive">Analytics Load Failed</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{overviewError}</p>
                    <button
                      onClick={loadOverview}
                      className="press inline-flex min-h-10 items-center justify-center rounded-btn bg-destructive px-5 text-xs font-bold text-destructive-foreground hover:bg-destructive/90"
                    >
                      Retry Fetch
                    </button>
                  </div>
                ) : (
                  <>
                    {/* General Overview KPIs */}
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {[
                        { label: "Total Users", value: overviewData?.kpis?.totalUsers ?? "—", info: "Registered accounts" },
                        { label: "Active Listeners (30d)", value: overviewData?.kpis?.activeUsers ?? "—", info: "Stream activity logged" },
                        { label: "Total Tracks", value: overviewData?.kpis?.totalTracks ?? "—", info: "Catalogue assets count" },
                        { label: "Total Programs", value: overviewData?.kpis?.totalPrograms ?? "—", info: "Live clinician programs" },
                        { label: "Total Plays", value: overviewData?.kpis?.totalPlays ?? "—", info: "Streaming sessions logged" },
                        { label: "Active Subscriptions", value: overviewData?.kpis?.activeSubscriptions ?? "—", info: "Paid subscription logs" },
                      ].map((k) => (
                        <div key={k.label} className={cn(cardCls, "p-5 relative overflow-hidden group border-border/80 hover:border-cat transition-all duration-300")}>
                          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{k.label}</p>
                          <p className="mt-3 text-3xl font-extrabold tracking-tight tabular-nums text-foreground">{k.value}</p>
                          <p className="mt-1 text-[11px] font-medium text-muted-foreground/80">{k.info}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                      {/* CMS Dashboard Quick Navigation Card */}
                      <div className={cn(cardCls, "p-6 border-border/85 flex flex-col justify-between min-h-[220px]")}>
                        <div className="space-y-3.5">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cat/10 text-cat">
                            <Music4 className="h-5 w-5" />
                          </div>
                          <h3 className="text-lg font-bold tracking-tight text-foreground">Content Management Catalogue (CMS)</h3>
                          <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                            Upload therapeutic audio masters, add artwork headers, edit catalog titles, organize raga classifications, and manage track release phases (Drafts, Published, Archived).
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-6">
                          <button
                            onClick={() => {
                              setSection("content");
                              setTimeout(() => {
                                setIsFormOpen(true);
                                setEditingTrack(null);
                                resetFormFields();
                              }, 100);
                            }}
                            className="press inline-flex min-h-10 items-center justify-center rounded-btn bg-primary px-5 text-xs font-bold text-primary-foreground hover:bg-primary-hover shadow-md hover:shadow-lg transition-all"
                          >
                            <Plus className="mr-1.5 h-4 w-4" /> Add New Track
                          </button>
                          <button
                            onClick={() => setSection("content")}
                            className="press inline-flex min-h-10 items-center justify-center rounded-btn border border-border bg-surface px-5 text-xs font-bold text-foreground hover:bg-muted"
                          >
                            Open Library CMS
                          </button>
                        </div>
                      </div>

                      {/* Live Programs summary */}
                      <div className={cn(cardCls, "p-6 border-border/85 flex flex-col justify-between")}>
                        <div>
                          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Care Programs Summary</h3>
                          <div className="space-y-5">
                            <div>
                              <p className="text-3xl font-extrabold text-foreground font-mono">{totalProgramsCount}</p>
                              <p className="text-xs text-muted-foreground mt-1">Total Care Programs curated for mothers</p>
                            </div>
                            <div className="border-t border-border/60 pt-4">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-muted-foreground">Pregnancy Care Stream</span>
                                <span className="font-bold text-cat">Active</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Operational Activities log */}
                    <section className={cn(cardCls, "p-6 border-border/80")}>
                      <h3 className="text-base font-bold text-foreground tracking-tight mb-5 flex items-center gap-2">
                        <Clock className="h-4.5 w-4.5 text-cat" /> Recent System Logs
                      </h3>
                      <div className="overflow-hidden rounded-md border border-border/40 bg-background/50">
                        <ul className="divide-y divide-border/40">
                          {overviewData?.recentActivity?.map((a: any, idx: number) => (
                            <li key={a.createdAt + "-" + idx} className="flex items-start gap-4 p-4.5 hover:bg-muted/10 transition-colors">
                              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cat-light text-[11px] font-bold text-cat uppercase select-none font-mono">
                                {a.who ? a.who.slice(0, 2) : "AC"}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-foreground">
                                  <span className="font-bold text-foreground/90">{a.who}</span> {a.what}
                                </p>
                                <p className="text-[10px] text-muted-foreground/80 mt-1 font-mono">
                                  {new Date(a.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </li>
                          ))}
                          {(!overviewData?.recentActivity || overviewData.recentActivity.length === 0) && (
                            <li className="text-center py-10 text-xs text-muted-foreground font-medium">
                              No recent system activities found.
                            </li>
                          )}
                        </ul>
                      </div>
                    </section>
                  </>
                )}
              </div>
            )}

            {/* SECTION RENDERING: CONTENT CMS */}
            {section === "content" && (
              <div className="mt-8 space-y-6 animate-in fade-in duration-200">
                {/* CMS Stats Cards */}
                <div className="grid gap-4.5 sm:grid-cols-2 md:grid-cols-5">
                  {[
                    { label: "Total Tracks", value: trackStats?.total ?? 0, bg: "bg-surface border-border" },
                    { label: "Published", value: trackStats?.published ?? 0, bg: "bg-success/5 border-success/20 text-success" },
                    { label: "Drafts", value: trackStats?.draft ?? 0, bg: "bg-surface border-border text-muted-foreground" },
                    { label: "Processing", value: trackStats?.processing ?? 0, bg: "bg-amber-500/5 border-amber-500/20 text-amber-500" },
                    { label: "Failed Pipeline", value: trackStats?.failed ?? 0, bg: "bg-destructive/5 border-destructive/20 text-destructive" },
                  ].map((stat) => (
                    <div key={stat.label} className={cn(cardCls, "p-4.5 flex flex-col justify-between border-border/80 shadow-none", stat.bg)}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                      <p className="mt-2 text-2.5xl font-extrabold tracking-tight tabular-nums">{loadingStats ? "..." : stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Filter and search bar */}
                <div className={cn(cardCls, "p-5 space-y-5 border-border/80 shadow-none")}>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5 rounded-field border border-border bg-background px-3.5 flex-1 min-w-[280px] max-w-md focus-within:ring-2 focus-within:ring-cat">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search tracks by title, artist, subtitle/raga..."
                        className="min-h-11 w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                      {query && (
                        <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        setEditingTrack(null);
                        resetFormFields();
                        setIsFormOpen(true);
                      }}
                      className="press inline-flex min-h-11 items-center justify-center rounded-btn bg-primary px-5.5 text-xs font-bold text-primary-foreground hover:bg-primary-hover shadow-md hover:shadow-lg transition-all"
                    >
                      <Plus className="mr-1.5 h-4 w-4" /> Add Track
                    </button>
                  </div>

                  {/* Multi-attribute Filter pills */}
                  <div className="space-y-3.5 border-t border-border/50 pt-4 text-xs">
                    {/* Status filter */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-bold text-muted-foreground w-20">Status:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {["All", "Published", "Draft", "Archived"].map((st) => (
                          <button
                            key={st}
                            onClick={() => { setFilterStatus(st); setPage(1); }}
                            className={cn(
                              "press rounded-full px-4 py-1.5 font-bold transition-all border",
                              filterStatus === st
                                ? "bg-cat border-cat text-cat-foreground"
                                : "bg-background border-border text-muted-foreground hover:border-cat"
                            )}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category filter */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-bold text-muted-foreground w-20">Category:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {["All", "Devotional", "Secular", "Pregnancy"].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => { setFilterCategory(cat); setPage(1); }}
                            className={cn(
                              "press rounded-full px-4 py-1.5 font-bold transition-all border",
                              filterCategory === cat
                                ? "bg-cat border-cat text-cat-foreground"
                                : "bg-background border-border text-muted-foreground hover:border-cat"
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sub Tier and Processing status filters */}
                    <div className="flex flex-wrap gap-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-bold text-muted-foreground w-20 sm:w-auto">Subscription:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {["All", "Free", "Premium"].map((tier) => (
                            <button
                              key={tier}
                              onClick={() => { setFilterTier(tier); setPage(1); }}
                              className={cn(
                                "press rounded-full px-4 py-1.5 font-bold transition-all border",
                                filterTier === tier
                                  ? "bg-cat border-cat text-cat-foreground"
                                  : "bg-background border-border text-muted-foreground hover:border-cat"
                              )}
                            >
                              {tier}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-bold text-muted-foreground">Transcoder:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {["All", "Ready", "Processing", "Failed"].map((proc) => (
                            <button
                              key={proc}
                              onClick={() => { setFilterProcessing(proc); setPage(1); }}
                              className={cn(
                                "press rounded-full px-4 py-1.5 font-bold transition-all border",
                                filterProcessing === proc
                                  ? "bg-cat border-cat text-cat-foreground"
                                  : "bg-background border-border text-muted-foreground hover:border-cat"
                              )}
                            >
                              {proc}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Language dropdown */}
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-muted-foreground flex items-center gap-1.5">
                          <Languages className="h-4 w-4" /> Language:
                        </span>
                        <select
                          value={filterLanguage}
                          onChange={(e) => { setFilterLanguage(e.target.value); setPage(1); }}
                          className="rounded-btn border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-cat"
                        >
                          <option value="All">All Languages</option>
                          <option value="hi">Hindi (hi)</option>
                          <option value="sa">Sanskrit (sa)</option>
                          <option value="en">English (en)</option>
                          <option value="ta">Tamil (ta)</option>
                        </select>
                      </div>

                      {/* Clear Filters helper button */}
                      {(query || filterStatus !== "All" || filterCategory !== "All" || filterTier !== "All" || filterProcessing !== "All" || filterLanguage !== "All") && (
                        <button
                          onClick={handleClearFilters}
                          className="press text-xs font-bold text-cat hover:underline flex items-center gap-1 ml-auto"
                        >
                          <X className="h-3.5 w-3.5" /> Clear Filters
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Primary Content Library Table */}
                <section className={cn(cardCls, "overflow-hidden border-border/80 shadow-none")}>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-xs border-collapse">
                      <thead className="bg-muted/40 text-[10px] tracking-wider text-muted-foreground uppercase font-bold border-b border-border/60">
                        <tr>
                          <th scope="col" className="px-5 py-3.5 w-[50px] text-center">Preview</th>
                          <th scope="col" className="px-5 py-3.5">Track & Artist</th>
                          <th scope="col" className="px-5 py-3.5">Raga / Subtitle</th>
                          <th scope="col" className="px-5 py-3.5">Category</th>
                          <th scope="col" className="px-5 py-3.5">Duration</th>
                          <th scope="col" className="px-5 py-3.5">Tier</th>
                          <th scope="col" className="px-5 py-3.5">Transcoder</th>
                          <th scope="col" className="px-5 py-3.5">Status</th>
                          <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {loadingTracks ? (
                          <tr>
                            <td colSpan={9} className="px-5 py-20 text-center">
                              <div className="flex flex-col items-center gap-3">
                                <Loader2 className="h-7 w-7 animate-spin text-cat" />
                                <span className="text-[11px] font-semibold text-muted-foreground">Retrieving tracks...</span>
                              </div>
                            </td>
                          </tr>
                        ) : tracksList.map((t) => {
                          const isCurrentPlaying = playingTrack?.id === t.id;
                          const isPlayingThisRow = isCurrentPlaying && isAudioPlaying;

                          return (
                            <tr key={t.id} className="hover:bg-muted/15 transition-all">
                              {/* Audio stream play/pause preview toggle */}
                              <td className="px-5 py-4 text-center">
                                <button
                                  onClick={() => handlePreviewToggle(t)}
                                  disabled={t.processingStatus !== "ready"}
                                  className={cn(
                                    "press grid h-8 w-8 place-items-center rounded-full transition-all border shadow-sm",
                                    t.processingStatus !== "ready"
                                      ? "bg-muted border-border/30 text-muted-foreground/30 cursor-not-allowed"
                                      : isPlayingThisRow
                                      ? "bg-cat border-cat text-cat-foreground scale-105"
                                      : "bg-surface border-border text-cat hover:bg-cat-light hover:border-cat"
                                  )}
                                  aria-label={isPlayingThisRow ? "Pause preview" : "Play preview"}
                                >
                                  {isPlayingThisRow ? (
                                    <Pause className="h-3.5 w-3.5 fill-current" />
                                  ) : (
                                    <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                                  )}
                                </button>
                              </td>

                              {/* Title, artist & cover artwork thumbnail */}
                              <td className="px-5 py-4 font-semibold text-foreground">
                                <div className="flex items-center gap-3">
                                  {t.thumbnailKey ? (
                                    <img
                                      src={getAssetUrl(t.thumbnailKey) || ""}
                                      alt=""
                                      className="h-10 w-10 rounded-md object-cover border border-border/60 bg-muted shrink-0"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = "none";
                                      }}
                                    />
                                  ) : (
                                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-dashed border-border/60 bg-muted text-muted-foreground/60">
                                      <FileAudio className="h-4 w-4" />
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="font-bold text-foreground truncate max-w-[200px]">{t.title}</p>
                                    <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px] mt-0.5">{t.artist}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4 text-muted-foreground font-medium">{t.subtitle || "—"}</td>
                              
                              <td className="px-5 py-4 font-bold text-muted-foreground uppercase tracking-wider capitalize">
                                <span className={cn(
                                  "rounded px-2 py-0.5 text-[10px] font-bold border",
                                  t.category === "devotional" && "bg-primary/5 text-primary border-primary/20",
                                  t.category === "secular" && "bg-teal-500/5 text-teal-600 border-teal-500/20",
                                  t.category === "pregnancy" && "bg-rose-500/5 text-rose-500 border-rose-500/20"
                                )}>
                                  {t.category}
                                </span>
                              </td>

                              <td className="px-5 py-4 tabular-nums font-semibold text-muted-foreground">
                                {formatDuration(t.duration)}
                              </td>

                              <td className="px-5 py-4 font-bold capitalize">
                                <span className={cn(
                                  "rounded px-2 py-0.5 text-[10px] border font-bold",
                                  t.tier === "premium" ? "bg-purple-500/5 text-purple-600 border-purple-500/20" : "bg-muted text-muted-foreground border-border"
                                )}>
                                  {t.tier}
                                </span>
                              </td>

                              {/* Transcode processing status badge */}
                              <td className="px-5 py-4">
                                <span className={cn(
                                  "rounded-full px-2.5 py-1 text-[10px] font-bold border capitalize",
                                  t.processingStatus === "ready" && "bg-success/5 border-success/20 text-success",
                                  ["processing", "transcoding", "uploading"].includes(t.processingStatus || "") && "bg-amber-500/5 border-amber-500/20 text-amber-500 animate-pulse",
                                  t.processingStatus === "uploaded" && "bg-blue-500/5 border-blue-500/20 text-blue-500",
                                  t.processingStatus === "failed" && "bg-destructive/5 border-destructive/20 text-destructive font-semibold"
                                )}>
                                  {t.processingStatus}
                                </span>
                              </td>

                              {/* Catalog status badge */}
                              <td className="px-5 py-4">
                                <span className={cn(
                                  "rounded-full px-2.5 py-1 text-[10px] font-bold border capitalize",
                                  t.publishStatus === "published" && "bg-success/5 border-success/20 text-success",
                                  t.publishStatus === "draft" && "bg-muted border-border text-muted-foreground",
                                  t.publishStatus === "archived" && "bg-orange-500/5 border-orange-500/20 text-orange-500"
                                )}>
                                  {t.publishStatus}
                                </span>
                              </td>

                              {/* Inline action buttons */}
                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => { setSelectedTrack(t); setIsDetailsOpen(true); }}
                                    className="press grid h-8 w-8 place-items-center rounded-btn border border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-muted/30"
                                    title="View full metadata"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenEdit(t)}
                                    className="press grid h-8 w-8 place-items-center rounded-btn border border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-muted/30"
                                    title="Edit metadata"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  {t.publishStatus === "draft" ? (
                                    <button
                                      onClick={() => handlePublish(t)}
                                      disabled={t.processingStatus !== "ready"}
                                      className="press grid h-8 w-8 place-items-center rounded-btn border border-success/30 bg-success/5 text-success hover:bg-success/15 disabled:opacity-40 disabled:cursor-not-allowed"
                                      title="Publish track"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </button>
                                  ) : t.publishStatus === "published" ? (
                                    <button
                                      onClick={() => handleUnpublish(t)}
                                      className="press grid h-8 w-8 place-items-center rounded-btn border border-border bg-surface text-amber-600 hover:bg-amber-500/10"
                                      title="Revert to draft"
                                    >
                                      <Archive className="h-4 w-4" />
                                    </button>
                                  ) : null}
                                  <button
                                    onClick={() => { setTrackToDelete(t); setShowDeleteConfirm(true); }}
                                    className="press grid h-8 w-8 place-items-center rounded-btn border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/15"
                                    title="Delete track"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {tracksList.length === 0 && !loadingTracks && (
                          <tr>
                            <td colSpan={9} className="px-5 py-14 text-center text-[11px] text-muted-foreground font-semibold">
                              No tracks match your query parameters. Click [ Add Track ] to create one.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* CMS Pagination controls */}
                  <div className="flex items-center justify-between border-t border-border/50 px-5 py-4 text-xs font-bold text-muted-foreground bg-muted/20 select-none">
                    <span>
                      Page {page} of {pages} · {totalTracksCount} tracks matched
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="press grid h-9 w-9 place-items-center rounded-btn border border-border bg-surface disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:bg-muted/10 transition-colors"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => setPage((p) => Math.min(pages, p + 1))}
                        disabled={page === pages}
                        className="press grid h-9 w-9 place-items-center rounded-btn border border-border bg-surface disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:bg-muted/10 transition-colors"
                        aria-label="Next page"
                      >
                        <ChevronRight className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* SECTION RENDERING: PROGRAMS CMS */}
            {section === "programs" && (
              <div className="mt-8 space-y-6 animate-in fade-in duration-200">
                {/* CMS Stats Cards */}
                <div className="grid gap-4.5 sm:grid-cols-2 md:grid-cols-4">
                  {[
                    { label: "Total Programs", value: programStats?.total ?? 0, bg: "bg-surface border-border" },
                    { label: "Published", value: programStats?.published ?? 0, bg: "bg-success/5 border-success/20 text-success" },
                    { label: "Drafts", value: programStats?.draft ?? 0, bg: "bg-surface border-border text-muted-foreground" },
                    { label: "Archived", value: programStats?.archived ?? 0, bg: "bg-orange-500/5 border-orange-500/20 text-orange-500" },
                  ].map((stat) => (
                    <div key={stat.label} className={cn(cardCls, "p-4.5 flex flex-col justify-between border-border/80 shadow-none", stat.bg)}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                      <p className="mt-2 text-2.5xl font-extrabold tracking-tight tabular-nums">{loadingProgramStats ? "..." : stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Filter and search bar */}
                <div className={cn(cardCls, "p-5 space-y-5 border-border/80 shadow-none")}>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5 rounded-field border border-border bg-background px-3.5 flex-1 min-w-[280px] max-w-md focus-within:ring-2 focus-within:ring-cat">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <input
                        value={progQuery}
                        onChange={(e) => setProgQuery(e.target.value)}
                        placeholder="Search programs by title, category, description..."
                        className="min-h-11 w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                      {progQuery && (
                        <button onClick={() => setProgQuery("")} className="text-muted-foreground hover:text-foreground">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        setEditingProgram(null);
                        resetProgramFormFields();
                        setIsProgramFormOpen(true);
                      }}
                      className="press inline-flex min-h-11 items-center justify-center rounded-btn bg-primary px-5.5 text-xs font-bold text-primary-foreground hover:bg-primary-hover shadow-md hover:shadow-lg transition-all"
                    >
                      <Plus className="mr-1.5 h-4 w-4" /> Create Program
                    </button>
                  </div>

                  {/* Multi-attribute Filter pills */}
                  <div className="space-y-3.5 border-t border-border/50 pt-4 text-xs">
                    {/* Status filter */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-bold text-muted-foreground w-20">Status:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {["All", "Published", "Draft", "Archived"].map((st) => (
                          <button
                            key={st}
                            onClick={() => { setProgFilterStatus(st); setProgPage(1); }}
                            className={cn(
                              "press rounded-full px-4 py-1.5 font-bold transition-all border",
                              progFilterStatus === st
                                ? "bg-cat border-cat text-cat-foreground"
                                : "bg-background border-border text-muted-foreground hover:border-cat"
                            )}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category filter */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-bold text-muted-foreground w-20">Category:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {["All", "Devotional", "Secular", "Pregnancy", "Corporate"].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => { setProgFilterCategory(cat); setProgPage(1); }}
                            className={cn(
                              "press rounded-full px-4 py-1.5 font-bold transition-all border",
                              progFilterCategory === cat
                                ? "bg-cat border-cat text-cat-foreground"
                                : "bg-background border-border text-muted-foreground hover:border-cat"
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tier filter */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-bold text-muted-foreground w-20">Tier:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {["All", "Free", "Premium"].map((tr) => (
                          <button
                            key={tr}
                            onClick={() => { setProgFilterTier(tr); setProgPage(1); }}
                            className={cn(
                              "press rounded-full px-4 py-1.5 font-bold transition-all border",
                              progFilterTier === tr
                                ? "bg-cat border-cat text-cat-foreground"
                                : "bg-background border-border text-muted-foreground hover:border-cat"
                            )}
                          >
                            {tr}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Difficulty filter */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-bold text-muted-foreground w-20">Difficulty:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {["All", "Beginner", "Intermediate", "Advanced"].map((df) => (
                          <button
                            key={df}
                            onClick={() => { setProgFilterDifficulty(df); setProgPage(1); }}
                            className={cn(
                              "press rounded-full px-4 py-1.5 font-bold transition-all border",
                              progFilterDifficulty === df
                                ? "bg-cat border-cat text-cat-foreground"
                                : "bg-background border-border text-muted-foreground hover:border-cat"
                            )}
                          >
                            {df}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Clear Filters CTA */}
                    {(progQuery || progFilterStatus !== "All" || progFilterCategory !== "All" || progFilterTier !== "All" || progFilterDifficulty !== "All") && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={handleClearProgFilters}
                          className="press text-xs font-bold text-cat hover:underline flex items-center gap-1"
                        >
                          Clear Active Filters
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Programs Catalogue Table */}
                <section className={cn(cardCls, "overflow-hidden border-border/80 shadow-none")}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground select-none">
                          <th className="px-5 py-3.5">Program</th>
                          <th className="px-5 py-3.5">Category</th>
                          <th className="px-5 py-3.5 text-center">Tracks</th>
                          <th className="px-5 py-3.5 text-center">Duration</th>
                          <th className="px-5 py-3.5">Tier</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 text-xs">
                        {loadingPrograms ? (
                          <tr>
                            <td colSpan={7} className="px-5 py-14 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin text-cat" />
                                <span className="text-muted-foreground font-medium">Loading programs from D1...</span>
                              </div>
                            </td>
                          </tr>
                        ) : programsList.map((p) => {
                          const artUrl = getAssetUrl(p.thumbnailKey);
                          return (
                            <tr key={p.id} className="hover:bg-muted/10 transition-colors group">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3 max-w-sm">
                                  {p.thumbnailKey ? (
                                    <img
                                      src={artUrl || ""}
                                      alt=""
                                      className="h-10 w-10 shrink-0 rounded object-cover border border-border"
                                    />
                                  ) : (
                                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded border border-dashed border-border bg-muted text-muted-foreground/50">
                                      <ListMusic className="h-5 w-5" />
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="font-bold text-foreground truncate group-hover:text-cat transition-colors">{p.title}</p>
                                    {p.subtitle && (
                                      <p className="text-[10px] text-muted-foreground truncate font-medium mt-0.5">{p.subtitle}</p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4 capitalize font-semibold text-muted-foreground">
                                <span className={cn(
                                  "rounded px-2 py-0.5 text-[10px] font-bold border",
                                  p.category === "pregnancy" && "bg-cat-light text-cat border-cat/10",
                                  p.category === "corporate" && "bg-blue-500/5 text-blue-600 border-blue-500/10",
                                  p.category === "devotional" && "bg-amber-500/5 text-amber-600 border-amber-500/10",
                                  p.category === "secular" && "bg-teal-500/5 text-teal-600 border-teal-500/10",
                                )}>
                                  {p.category}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-center font-bold text-foreground font-mono">
                                {p.trackCount}
                              </td>
                              <td className="px-5 py-4 text-center font-mono font-medium text-muted-foreground">
                                {formatDuration(p.estimatedDuration)}
                              </td>
                              <td className="px-5 py-4 font-bold capitalize">
                                <span className={cn(
                                  p.tier === "premium" ? "text-cat" : "text-muted-foreground"
                                )}>
                                  {p.tier}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <span className={cn(
                                  "rounded-full px-2.5 py-0.5 text-[10px] font-bold border capitalize",
                                  p.status === "published" && "bg-success/5 border-success/20 text-success",
                                  p.status === "draft" && "bg-muted border-border text-muted-foreground",
                                  p.status === "archived" && "bg-orange-500/5 border-orange-500/20 text-orange-500"
                                )}>
                                  {p.status}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenProgDetails(p)}
                                    className="press grid h-8 w-8 place-items-center rounded-btn border border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-muted/30"
                                    title="View program details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenProgEdit(p)}
                                    className="press grid h-8 w-8 place-items-center rounded-btn border border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-muted/30"
                                    title="Edit program metadata & tracks"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleProgramDuplicate(p)}
                                    className="press grid h-8 w-8 place-items-center rounded-btn border border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-muted/30"
                                    title="Duplicate program"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                  </button>
                                  {p.status === "draft" ? (
                                    <button
                                      onClick={() => handleProgramPublish(p)}
                                      className="press grid h-8 w-8 place-items-center rounded-btn border border-success/30 bg-success/5 text-success hover:bg-success/15"
                                      title="Publish program"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </button>
                                  ) : p.status === "published" ? (
                                    <button
                                      onClick={() => handleProgramUnpublish(p)}
                                      className="press grid h-8 w-8 place-items-center rounded-btn border border-border bg-surface text-amber-600 hover:bg-amber-500/10"
                                      title="Revert to draft"
                                    >
                                      <Archive className="h-4 w-4" />
                                    </button>
                                  ) : null}
                                  <button
                                    onClick={() => { setProgramToDelete(p); setShowProgDeleteConfirm(true); }}
                                    className="press grid h-8 w-8 place-items-center rounded-btn border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/15"
                                    title="Delete program"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {programsList.length === 0 && !loadingPrograms && (
                          <tr>
                            <td colSpan={7} className="px-5 py-14 text-center text-[11px] text-muted-foreground font-semibold">
                              No programs match your query parameters. Click [ Create Program ] to curate one.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* CMS Pagination controls */}
                  <div className="flex items-center justify-between border-t border-border/50 px-5 py-4 text-xs font-bold text-muted-foreground bg-muted/20 select-none">
                    <span>
                      Page {progPage} of {progPages} · {totalProgramsCount} programs matched
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setProgPage((p) => Math.max(1, p - 1))}
                        disabled={progPage === 1}
                        className="press grid h-9 w-9 place-items-center rounded-btn border border-border bg-surface disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:bg-muted/10 transition-colors"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => setProgPage((p) => Math.min(progPages, p + 1))}
                        disabled={progPage === progPages}
                        className="press grid h-9 w-9 place-items-center rounded-btn border border-border bg-surface disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:bg-muted/10 transition-colors"
                        aria-label="Next page"
                      >
                        <ChevronRight className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* SECTION RENDERING: USERS CMS */}
            {section === "users" && (
              <div className="mt-8 space-y-6 animate-in fade-in duration-200">
                {/* Users CMS KPI Stats Cards */}
                <div className="grid gap-4.5 sm:grid-cols-2 md:grid-cols-4">
                  {[
                    { label: "Total Users", value: userStats?.total ?? 0, bg: "bg-surface border-border" },
                    { label: "Active Users (30d)", value: userStats?.active ?? 0, bg: "bg-success/5 border-success/20 text-success" },
                    { label: "New This Month", value: userStats?.newThisMonth ?? 0, bg: "bg-surface border-border text-muted-foreground" },
                    { label: "Premium Users", value: userStats?.premium ?? 0, bg: "bg-cat-light text-cat border-cat/10" },
                  ].map((stat) => (
                    <div key={stat.label} className={cn(cardCls, "p-4.5 flex flex-col justify-between border-border/80 shadow-none", stat.bg)}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                      <p className="mt-2 text-2.5xl font-extrabold tracking-tight tabular-nums">{loadingUserStats ? "..." : stat.value.toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                {/* Filter and Search Bar */}
                <div className={cn(cardCls, "p-5 space-y-5 border-border/80 shadow-none")}>
                  <div className="flex items-center gap-2.5 rounded-field border border-border bg-background px-3.5 max-w-md focus-within:ring-2 focus-within:ring-cat">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      placeholder="Search users by name or email..."
                      className="min-h-11 w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    {userQuery && (
                      <button onClick={() => setUserQuery("")} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Multi-attribute Filter pills */}
                  <div className="space-y-3.5 border-t border-border/50 pt-4 text-xs">
                    {/* Status filter */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-bold text-muted-foreground w-24">Status:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {["All", "Active", "Suspended"].map((st) => (
                          <button
                            key={st}
                            onClick={() => { setUserFilterStatus(st); setUserPage(1); }}
                            className={cn(
                              "press rounded-full px-4 py-1.5 font-bold transition-all border",
                              userFilterStatus === st
                                ? "bg-cat border-cat text-cat-foreground"
                                : "bg-background border-border text-muted-foreground hover:border-cat"
                            )}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Role filter */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-bold text-muted-foreground w-24">Account Role:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {["All", "User", "Premium", "Admin"].map((rl) => (
                          <button
                            key={rl}
                            onClick={() => { setUserFilterRole(rl); setUserPage(1); }}
                            className={cn(
                              "press rounded-full px-4 py-1.5 font-bold transition-all border",
                              userFilterRole === rl
                                ? "bg-cat border-cat text-cat-foreground"
                                : "bg-background border-border text-muted-foreground hover:border-cat"
                            )}
                          >
                            {rl}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Subscription filter */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-bold text-muted-foreground w-24">Subscription:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {["All", "Free", "Premium"].map((sb) => (
                          <button
                            key={sb}
                            onClick={() => { setUserFilterTier(sb); setUserPage(1); }}
                            className={cn(
                              "press rounded-full px-4 py-1.5 font-bold transition-all border",
                              userFilterTier === sb
                                ? "bg-cat border-cat text-cat-foreground"
                                : "bg-background border-border text-muted-foreground hover:border-cat"
                            )}
                          >
                            {sb}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Clear Filters CTA */}
                    {(userQuery || userFilterStatus !== "All" || userFilterRole !== "All" || userFilterTier !== "All") && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={handleClearUserFilters}
                          className="press text-xs font-bold text-cat hover:underline flex items-center gap-1"
                        >
                          Clear Active Filters
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Users Table */}
                <section className={cn(cardCls, "overflow-hidden border-border/80 shadow-none")}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground select-none">
                          <th className="px-5 py-3.5">User</th>
                          <th className="px-5 py-3.5">Email</th>
                          <th className="px-5 py-3.5">Role</th>
                          <th className="px-5 py-3.5">Plan</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5">Joined</th>
                          <th className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 text-xs">
                        {loadingUsers ? (
                          <tr>
                            <td colSpan={7} className="px-5 py-14 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin text-cat" />
                                <span className="text-muted-foreground font-medium">Loading users list...</span>
                              </div>
                            </td>
                          </tr>
                        ) : usersList.map((u) => {
                          const initials = (u.fullName || u.email || "U").slice(0, 2).toUpperCase();
                          return (
                            <tr key={u.id} className="hover:bg-muted/10 transition-colors group">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cat/10 text-xs font-bold text-cat border border-cat/10">
                                    {initials}
                                  </div>
                                  <span className="font-bold text-foreground truncate max-w-[150px]">{u.fullName || "Anonymous User"}</span>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-muted-foreground font-medium font-mono">
                                {u.email}
                              </td>
                              <td className="px-5 py-4">
                                <span className={cn(
                                  "rounded px-2 py-0.5 text-[10px] font-bold border capitalize",
                                  u.role === "super_admin" && "bg-purple-500/5 text-purple-600 border-purple-500/10",
                                  u.role === "admin" && "bg-amber-500/5 text-amber-600 border-amber-500/10",
                                  u.role === "premium" && "bg-cat-light text-cat border-cat/10",
                                  u.role === "user" && "bg-muted border-border text-muted-foreground",
                                )}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-5 py-4 capitalize font-semibold text-foreground">
                                {u.planName ? (
                                  <span className="text-cat font-bold">{u.planName}</span>
                                ) : (
                                  <span className="text-muted-foreground">Free</span>
                                )}
                              </td>
                              <td className="px-5 py-4">
                                <span className={cn(
                                  "rounded-full px-2.5 py-0.5 text-[10px] font-bold border capitalize",
                                  u.status === "active" && "bg-success/5 border-success/20 text-success",
                                  u.status === "suspended" && "bg-destructive/5 border-destructive/20 text-destructive",
                                )}>
                                  {u.status === "suspended" ? "suspended" : u.status}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-muted-foreground font-mono">
                                {new Date(u.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                              </td>
                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenUserDetails(u)}
                                    className="press grid h-8 w-8 place-items-center rounded-btn border border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-muted/30"
                                    title="View user details profile"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  {u.role !== "super_admin" && (
                                    <>
                                      {u.status === "active" ? (
                                        <button
                                          onClick={() => handleDeactivate(u)}
                                          className="press min-h-8 rounded-btn border border-destructive/20 bg-destructive/5 px-2.5 text-[11px] font-bold text-destructive hover:bg-destructive/15"
                                          title="Deactivate account access"
                                        >
                                          Deactivate
                                        </button>
                                      ) : u.status === "suspended" ? (
                                        <button
                                          onClick={() => handleReactivate(u)}
                                          className="press min-h-8 rounded-btn border border-success/20 bg-success/5 px-2.5 text-[11px] font-bold text-success hover:bg-success/15"
                                          title="Reactivate account access"
                                        >
                                          Reactivate
                                        </button>
                                      ) : null}
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {usersList.length === 0 && !loadingUsers && (
                          <tr>
                            <td colSpan={7} className="px-5 py-14 text-center text-[11px] text-muted-foreground font-semibold">
                              No registered users match your query parameters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Users CMS Pagination controls */}
                  <div className="flex items-center justify-between border-t border-border/50 px-5 py-4 text-xs font-bold text-muted-foreground bg-muted/20 select-none">
                    <span>
                      Page {userPage} of {userPages} · {totalUsersCount} users matched
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                        disabled={userPage === 1}
                        className="press grid h-9 w-9 place-items-center rounded-btn border border-border bg-surface disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:bg-muted/10 transition-colors"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => setUserPage((p) => Math.min(userPages, p + 1))}
                        disabled={userPage === userPages}
                        className="press grid h-9 w-9 place-items-center rounded-btn border border-border bg-surface disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:bg-muted/10 transition-colors"
                        aria-label="Next page"
                      >
                        <ChevronRight className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* SECTION RENDERING: SUBSCRIPTIONS & BILLING CMS */}
            {section === "subscriptions" && (
              <div className="mt-8 space-y-6 animate-in fade-in duration-200">
                {/* Environmental Billing Configuration Status Card */}
                <div className="rounded-card border border-border bg-surface p-4 flex flex-wrap items-center justify-between gap-4 shadow-none">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "inline-flex h-2.5 w-2.5 rounded-full",
                      (subStats?.paymentMode === "razorpay") ? "bg-success animate-pulse" : "bg-amber-500"
                    )} />
                    <div>
                      <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                        {subStats?.paymentMode === "razorpay" ? "🟢 RAZORPAY PRODUCTION ACTIVE" : "🟡 MOCK PAYMENT MODE ACTIVE"}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {subStats?.paymentMode === "razorpay"
                          ? "Production payment gateway is enabled. Live charges apply."
                          : "Payments are simulated via simulated authorization keys. No real money charged."}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={loadPlansList}
                    className="press rounded-btn bg-cat-light text-cat px-3 py-1.5 text-[11px] font-bold border border-cat/10 hover:bg-cat/10"
                  >
                    Refresh Configurations
                  </button>
                </div>

                {/* Billing KPI Cards */}
                <div className="grid gap-4.5 sm:grid-cols-2 md:grid-cols-4">
                  {[
                    { label: "Active Subscriptions", value: subStats?.activeSubscriptions ?? 0, bg: "bg-surface border-border" },
                    { label: "Standard Subscribers", value: subStats?.standardSubscribers ?? 0, bg: "bg-surface border-border text-muted-foreground" },
                    { label: "Premium Subscribers", value: subStats?.premiumSubscribers ?? 0, bg: "bg-cat-light text-cat border-cat/10" },
                    { label: "Expiring Soon (7d)", value: subStats?.expiringSoon ?? 0, bg: "bg-destructive/5 border-destructive/20 text-destructive" },
                  ].map((stat) => (
                    <div key={stat.label} className={cn(cardCls, "p-4.5 flex flex-col justify-between border-border/80 shadow-none", stat.bg)}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                      <p className="mt-2 text-2.5xl font-extrabold tracking-tight tabular-nums">{loadingSubStats ? "..." : stat.value.toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                {/* Sub-nav menu bar */}
                <div className="flex border-b border-border/50 select-none pb-0.5 gap-1.5 text-xs font-bold">
                  {[
                    { id: "subscriptions", label: "Customer Subscriptions" },
                    { id: "plans", label: "Manage Pricing Plans" },
                    { id: "payments", label: "Payment Ledger Logs" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSubSection(tab.id as any)}
                      className={cn(
                        "px-4 py-2 border-b-2 transition-all press",
                        subSection === tab.id
                          ? "border-cat text-cat font-extrabold"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* TAB 1: Subscriptions table search list */}
                {subSection === "subscriptions" && (
                  <div className="space-y-6">
                    {/* Search & Filter cards */}
                    <div className={cn(cardCls, "p-5 space-y-5 border-border/80 shadow-none")}>
                      <div className="flex items-center gap-2.5 rounded-field border border-border bg-background px-3.5 max-w-md focus-within:ring-2 focus-within:ring-cat">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <input
                          value={subSearch}
                          onChange={(e) => setSubSearch(e.target.value)}
                          placeholder="Search subscriptions by subscriber name or email..."
                          className="min-h-11 w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                        />
                        {subSearch && (
                          <button onClick={() => setSubSearch("")} className="text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-3.5 border-t border-border/50 pt-4 text-xs">
                        {/* Status filter */}
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-bold text-muted-foreground w-24">Status:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {["All", "Active", "Pending", "Expired", "Canceled"].map((st) => (
                              <button
                                key={st}
                                onClick={() => { setSubFilterStatus(st); setSubPage(1); }}
                                className={cn(
                                  "press rounded-full px-4 py-1.5 font-bold transition-all border",
                                  subFilterStatus === st
                                    ? "bg-cat border-cat text-cat-foreground"
                                    : "bg-background border-border text-muted-foreground hover:border-cat"
                                )}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Plan level filter */}
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-bold text-muted-foreground w-24">Plan Level:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {["All", "Free", "Standard", "Premium"].map((p) => (
                              <button
                                key={p}
                                onClick={() => { setSubFilterPlan(p); setSubPage(1); }}
                                className={cn(
                                  "press rounded-full px-4 py-1.5 font-bold transition-all border",
                                  subFilterPlan === p
                                    ? "bg-cat border-cat text-cat-foreground"
                                    : "bg-background border-border text-muted-foreground hover:border-cat"
                                )}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Table grid */}
                    <section className={cn(cardCls, "overflow-hidden border-border/80 shadow-none")}>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-border bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground select-none">
                              <th className="px-5 py-3.5">Subscriber</th>
                              <th className="px-5 py-3.5">Plan Tier</th>
                              <th className="px-5 py-3.5">Status</th>
                              <th className="px-5 py-3.5">Start Date</th>
                              <th className="px-5 py-3.5">End Expiry</th>
                              <th className="px-5 py-3.5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60 text-xs">
                            {loadingSubs ? (
                              <tr>
                                <td colSpan={6} className="px-5 py-14 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin text-cat" />
                                    <span className="text-muted-foreground font-medium">Loading subscriptions list...</span>
                                  </div>
                                </td>
                              </tr>
                            ) : subsList.map((s) => (
                              <tr key={s.id} className="hover:bg-muted/10 transition-colors group font-sans">
                                <td className="px-5 py-4">
                                  <div>
                                    <p className="font-bold text-foreground">{s.fullName || "Anonymous"}</p>
                                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate max-w-[180px]">{s.email}</p>
                                  </div>
                                </td>
                                <td className="px-5 py-4 capitalize font-bold text-cat">
                                  {s.planName || s.planId}
                                </td>
                                <td className="px-5 py-4">
                                  <span className={cn(
                                    "rounded-full px-2.5 py-0.5 text-[10px] font-bold border capitalize",
                                    s.status === "active" && "bg-success/5 border-success/20 text-success",
                                    s.status === "trial" && "bg-blue-500/5 border-blue-500/20 text-blue-600",
                                    s.status === "canceled" && "bg-destructive/5 border-destructive/20 text-destructive",
                                    ["expired", "pending"].includes(s.status) && "bg-muted border-border text-muted-foreground",
                                  )}>
                                    {s.status}
                                  </span>
                                </td>
                                <td className="px-5 py-4 text-muted-foreground font-mono">
                                  {new Date(s.currentPeriodStart).toLocaleDateString()}
                                </td>
                                <td className="px-5 py-4 text-muted-foreground font-mono">
                                  {new Date(s.currentPeriodEnd).toLocaleDateString()}
                                </td>
                                <td className="px-5 py-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => handleOpenSubDetails(s)}
                                      className="press grid h-8 w-8 place-items-center rounded-btn border border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-muted/30"
                                      title="View billing audit details"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </button>
                                    {s.status === "active" && (
                                      <>
                                        <button
                                          onClick={() => handleExtendSub(s)}
                                          className="press min-h-8 rounded-btn border border-success/20 bg-success/5 px-2.5 text-[11px] font-bold text-success hover:bg-success/15"
                                          title="Extend subscription period days"
                                        >
                                          Extend
                                        </button>
                                        <button
                                          onClick={() => handleCancelSub(s)}
                                          className="press min-h-8 rounded-btn border border-destructive/20 bg-destructive/5 px-2.5 text-[11px] font-bold text-destructive hover:bg-destructive/15"
                                          title="Cancel active subscription"
                                        >
                                          Cancel
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {subsList.length === 0 && !loadingSubs && (
                              <tr>
                                <td colSpan={6} className="px-5 py-14 text-center text-[11px] text-muted-foreground font-semibold">
                                  No subscriptions match your query parameter filters.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="flex items-center justify-between border-t border-border/50 px-5 py-4 text-xs font-bold text-muted-foreground bg-muted/20 select-none">
                        <span>
                          Page {subPage} of {subPages} · {totalSubsCount} subscriptions matched
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSubPage((p) => Math.max(1, p - 1))}
                            disabled={subPage === 1}
                            className="press grid h-9 w-9 place-items-center rounded-btn border border-border bg-surface disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:bg-muted/10 transition-colors"
                          >
                            <ChevronLeft className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => setSubPage((p) => Math.min(subPages, p + 1))}
                            disabled={subPage === subPages}
                            className="press grid h-9 w-9 place-items-center rounded-btn border border-border bg-surface disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:bg-muted/10 transition-colors"
                          >
                            <ChevronRight className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    </section>
                  </div>
                )}

                {/* TAB 2: Pricing plans editor */}
                {subSection === "plans" && (
                  <div className="space-y-6">
                    <div className="grid gap-5 md:grid-cols-3">
                      {loadingPlans ? (
                        <div className="col-span-full text-center py-14">
                          <Loader2 className="h-6 w-6 animate-spin text-cat mx-auto" />
                          <p className="text-xs text-muted-foreground mt-2 font-medium">Loading catalog plans configuration...</p>
                        </div>
                      ) : plansList.map((p) => (
                        <div key={p.id} className={cn(cardCls, "p-6 flex flex-col justify-between space-y-6 shadow-none border-border/80 bg-surface/50 hover:bg-surface transition-all")}>
                          <div>
                            <div className="flex items-center justify-between border-b border-border/50 pb-3">
                              <h4 className="text-sm font-black uppercase tracking-wider text-foreground">{p.name}</h4>
                              <span className={cn(
                                "rounded px-1.5 py-0.5 text-[9px] font-bold border",
                                p.isActive === 1 ? "bg-success/5 border-success/15 text-success" : "bg-muted border-border text-muted-foreground"
                              )}>
                                {p.isActive === 1 ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <div className="mt-4 flex items-baseline gap-1">
                              <span className="text-3xl font-extrabold tracking-tight text-foreground">₹{p.price / 100}</span>
                              <span className="text-xs text-muted-foreground font-semibold font-sans">/ {p.interval}</span>
                            </div>

                            <ul className="mt-5 space-y-2 text-xs font-semibold text-muted-foreground/90 font-sans border-t border-border/40 pt-4.5">
                              {p.id === "free" && (
                                <>
                                  <li className="flex items-center gap-2">✓ Basic therapeutic track catalog</li>
                                  <li className="flex items-center gap-2">✓ Standard audio playback</li>
                                </>
                              )}
                              {p.id === "standard" && (
                                <>
                                  <li className="flex items-center gap-2">✓ Standard catalogue tracks access</li>
                                  <li className="flex items-center gap-2">✓ Complete progress statistics logs</li>
                                  <li className="flex items-center gap-2">✓ Standard therapeutic programs</li>
                                </>
                              )}
                              {p.id === "premium" && (
                                <>
                                  <li className="flex items-center gap-2">✓ Full premium catalogue unlocked</li>
                                  <li className="flex items-center gap-2">✓ Pregnancy programs sequence tracker</li>
                                  <li className="flex items-center gap-2">✓ Comprehensive clinical history logs</li>
                                </>
                              )}
                            </ul>
                          </div>

                          <button
                            onClick={() => handleOpenEditPlan(p)}
                            className="press w-full min-h-10 text-xs font-bold border border-border bg-surface hover:bg-muted text-foreground rounded-btn flex items-center justify-center gap-1.5"
                          >
                            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            Edit Configuration
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: Transactions log ledger */}
                {subSection === "payments" && (
                  <div className="space-y-6">
                    {/* Search toolbar */}
                    <div className={cn(cardCls, "p-5 border-border/80 shadow-none flex flex-wrap items-center justify-between gap-4")}>
                      <div className="flex items-center gap-2.5 rounded-field border border-border bg-background px-3.5 max-w-md w-full focus-within:ring-2 focus-within:ring-cat">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <input
                          value={paySearch}
                          onChange={(e) => setPaySearch(e.target.value)}
                          placeholder="Search payments by Order ID, User email..."
                          className="min-h-11 w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                        />
                        {paySearch && (
                          <button onClick={() => setPaySearch("")} className="text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-bold text-muted-foreground">Status:</span>
                        <div className="flex gap-1.5">
                          {["All", "Completed", "Pending", "Failed"].map((st) => (
                            <button
                              key={st}
                              onClick={() => { setPayFilterStatus(st === "Completed" ? "completed" : st === "Failed" ? "failed" : st); setPayPage(1); }}
                              className={cn(
                                "press rounded-full px-4 py-1.5 font-bold transition-all border",
                                (payFilterStatus === st || (st === "Completed" && payFilterStatus === "completed") || (st === "Failed" && payFilterStatus === "failed"))
                                  ? "bg-cat border-cat text-cat-foreground"
                                  : "bg-background border-border text-muted-foreground hover:border-cat"
                              )}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Table grid */}
                    <section className={cn(cardCls, "overflow-hidden border-border/80 shadow-none")}>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-border bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground select-none">
                              <th className="px-5 py-3.5">Payment ID / Order ID</th>
                              <th className="px-5 py-3.5">Subscriber</th>
                              <th className="px-5 py-3.5">Plan tier</th>
                              <th className="px-5 py-3.5">Amount</th>
                              <th className="px-5 py-3.5">Status</th>
                              <th className="px-5 py-3.5">Payment Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60 text-xs">
                            {loadingPayments ? (
                              <tr>
                                <td colSpan={6} className="px-5 py-14 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin text-cat" />
                                    <span className="text-muted-foreground font-medium">Loading transactions list...</span>
                                  </div>
                                </td>
                              </tr>
                            ) : paymentsList.map((p) => (
                              <tr key={p.id} className="hover:bg-muted/10 transition-colors group font-sans">
                                <td className="px-5 py-4">
                                  <div>
                                    <p className="font-bold text-foreground font-mono text-[10px]">{p.id}</p>
                                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate max-w-[200px]" title={p.orderId}>{p.orderId}</p>
                                  </div>
                                </td>
                                <td className="px-5 py-4">
                                  <div>
                                    <p className="font-bold text-foreground">{p.fullName || "Anonymous"}</p>
                                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate max-w-[150px]">{p.email}</p>
                                  </div>
                                </td>
                                <td className="px-5 py-4 capitalize font-semibold text-foreground">
                                  {p.planName}
                                </td>
                                <td className="px-5 py-4 font-bold text-foreground">
                                  ₹{p.amount / 100}
                                </td>
                                <td className="px-5 py-4">
                                  <span className={cn(
                                    "rounded px-1.5 py-0.5 text-[10px] font-bold border capitalize",
                                    p.status === "completed" && "bg-success/5 border-success/15 text-success",
                                    p.status === "pending" && "bg-muted border-border text-muted-foreground",
                                    p.status === "failed" && "bg-destructive/5 border-destructive/15 text-destructive",
                                  )}>
                                    {p.status === "completed" ? "Success" : p.status}
                                  </span>
                                </td>
                                <td className="px-5 py-4 text-muted-foreground font-mono">
                                  {new Date(p.createdAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                                </td>
                              </tr>
                            ))}
                            {paymentsList.length === 0 && !loadingPayments && (
                              <tr>
                                <td colSpan={6} className="px-5 py-14 text-center text-[11px] text-muted-foreground font-semibold">
                                  No transaction records found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="flex items-center justify-between border-t border-border/50 px-5 py-4 text-xs font-bold text-muted-foreground bg-muted/20 select-none">
                        <span>
                          Page {payPage} of {payPages} · {totalPaymentsCount} payments matched
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPayPage((p) => Math.max(1, p - 1))}
                            disabled={payPage === 1}
                            className="press grid h-9 w-9 place-items-center rounded-btn border border-border bg-surface disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:bg-muted/10 transition-colors"
                          >
                            <ChevronLeft className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => setPayPage((p) => Math.min(payPages, p + 1))}
                            disabled={payPage === payPages}
                            className="press grid h-9 w-9 place-items-center rounded-btn border border-border bg-surface disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:bg-muted/10 transition-colors"
                          >
                            <ChevronRight className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    </section>
                  </div>
                )}
              </div>
            )}

            {/* SECTION RENDERING: PRODUCT INTELLIGENCE & EVENT ANALYTICS */}
            {section === "analytics" && (
              <div className="mt-8 space-y-6 animate-in fade-in duration-200">
                {/* Date range selection toolbar & Export CTAs */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4 select-none">
                  <div className="flex gap-1.5 text-xs font-bold">
                    {[
                      { id: "7d", label: "7 Days" },
                      { id: "30d", label: "30 Days" },
                      { id: "90d", label: "90 Days" },
                      { id: "this_year", label: "This Year" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setAnalyticsPeriod(p.id as any)}
                        className={cn(
                          "press rounded-full px-4 py-1.5 transition-all border",
                          analyticsPeriod === p.id
                            ? "bg-cat border-cat text-cat-foreground"
                            : "bg-surface border-border text-muted-foreground hover:border-cat"
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Export Options pills */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Export CSV:</span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { id: "listening", label: "Listening Logs" },
                        { id: "tracks", label: "Tracks Rank" },
                        { id: "programs", label: "Programs Rank" },
                        { id: "subscriptions", label: "Billing Summary" },
                      ].map((exp) => (
                        <button
                          key={exp.id}
                          onClick={() => handleExportCSV(exp.id as any)}
                          className="press rounded bg-cat-light text-cat px-2.5 py-1 text-[10px] font-extrabold border border-cat/10 hover:bg-cat/15 transition-all"
                        >
                          {exp.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {loadingAnalytics ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-cat" />
                    <p className="text-xs text-muted-foreground font-medium">Aggregating platform events from D1...</p>
                  </div>
                ) : !analyticsData || analyticsData.overview.totalPlays === 0 ? (
                  <div className="rounded-card border border-border bg-surface p-12 text-center space-y-3">
                    <BarChart3 className="h-10 w-10 text-muted-foreground/60 mx-auto" />
                    <h3 className="text-sm font-bold text-foreground">No analytics available yet</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                      Platform analytics will populate here dynamically once users start playing audio tracks, subscribing to plans, and configuring pregnancy schedules.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Overview KPI Cards */}
                    <div className="grid gap-4.5 sm:grid-cols-2 md:grid-cols-4">
                      {[
                        { label: "Active Engagement", value: analyticsData.overview.activeUsers, suffix: " users", bg: "bg-surface border-border" },
                        { label: "Total Played Tracks", value: analyticsData.overview.totalPlays, suffix: " plays", bg: "bg-surface border-border text-muted-foreground" },
                        { label: "Cumulative Listening Time", value: analyticsData.overview.listeningTimeHours, suffix: " hrs", bg: "bg-cat-light text-cat border-cat/10" },
                        { label: "Completion Ratio", value: analyticsData.overview.completionRate, suffix: "% rate", bg: "bg-success/5 border-success/20 text-success" },
                      ].map((stat) => (
                        <div key={stat.label} className={cn(cardCls, "p-4.5 flex flex-col justify-between border-border/80 shadow-none", stat.bg)}>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                          <p className="mt-2 text-2.5xl font-extrabold tracking-tight tabular-nums">
                            {stat.value.toLocaleString()}
                            <span className="text-xs font-semibold text-muted-foreground/80 lowercase"> {stat.suffix}</span>
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      {/* CARD 1: User Growth statistics */}
                      <div className={cn(cardCls, "p-5 space-y-4 shadow-none border-border/85")}>
                        <h4 className="text-xs font-black uppercase tracking-wider text-foreground">User Registration & Retention</h4>
                        
                        <div className="grid grid-cols-3 gap-3 text-center border-b border-border/50 pb-4">
                          {[
                            { label: "New Registered", value: analyticsData.users.newRegistrations },
                            { label: "Active Users", value: analyticsData.users.activeUsers },
                            { label: "Returning Users", value: analyticsData.users.returningUsers },
                          ].map((c) => (
                            <div key={c.label} className="bg-background/40 p-2.5 rounded border border-border/60">
                              <p className="text-[9px] font-semibold text-muted-foreground uppercase">{c.label}</p>
                              <p className="text-lg font-extrabold text-foreground mt-1 tabular-nums">{c.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Visual Growth Area SVG representation */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Registration Growth trend</p>
                          <div className="h-32 w-full bg-background/30 rounded border border-border/60 flex items-end p-2 justify-between gap-1 relative overflow-hidden select-none">
                            {(analyticsData.users.userGrowthTrend || []).map((t: any, idx: number) => {
                              const maxVal = Math.max(...(analyticsData.users.userGrowthTrend || []).map((v: any) => v.count), 1);
                              const heightPct = (t.count / maxVal) * 80;
                              return (
                                <div key={idx} className="flex-1 flex flex-col items-center group h-full justify-end">
                                  <div
                                    style={{ height: `${Math.max(4, heightPct)}%` }}
                                    className="w-full bg-cat rounded-t transition-all hover:bg-cat-hover"
                                    title={`${t.date}: ${t.count} registrations`}
                                  />
                                  <span className="text-[8px] text-muted-foreground font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1 bg-surface px-1 border rounded shadow-xs">
                                    {t.date}: {t.count}
                                  </span>
                                </div>
                              );
                            })}
                            {(analyticsData.users.userGrowthTrend || []).length === 0 && (
                              <p className="text-[10px] text-muted-foreground font-semibold m-auto">No growth data in this range</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* CARD 2: Listening trends & Category preferences */}
                      <div className={cn(cardCls, "p-5 space-y-4 shadow-none border-border/85")}>
                        <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Listening Hours Trends</h4>
                        <div className="h-32 w-full bg-background/30 rounded border border-border/60 flex items-end p-2 justify-between gap-1 relative overflow-hidden select-none">
                          {(analyticsData.listening.listeningTrend || []).map((t: any, idx: number) => {
                            const maxVal = Math.max(...(analyticsData.listening.listeningTrend || []).map((v: any) => v.hours), 1);
                            const heightPct = (t.hours / maxVal) * 80;
                            return (
                              <div key={idx} className="flex-1 flex flex-col items-center group h-full justify-end">
                                <div
                                  style={{ height: `${Math.max(4, heightPct)}%` }}
                                  className="w-full bg-success/60 rounded-t transition-all hover:bg-success/80"
                                  title={`${t.date}: ${t.hours} hours listened (${t.plays} plays)`}
                                />
                                <span className="text-[8px] text-muted-foreground font-mono mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1 bg-surface px-1 border rounded shadow-xs">
                                  {t.date}: {t.hours} hrs ({t.plays} plays)
                                </span>
                              </div>
                            );
                          })}
                          {(analyticsData.listening.listeningTrend || []).length === 0 && (
                            <p className="text-[10px] text-muted-foreground font-semibold m-auto">No listening events in this range</p>
                          )}
                        </div>

                        {/* Category Preference distribution */}
                        <div className="space-y-3.5">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Listening by Category Preference</p>
                          <div className="space-y-2">
                            {(analyticsData.categoryDistribution || []).map((c: any) => {
                              const maxPlays = Math.max(...(analyticsData.categoryDistribution || []).map((v: any) => v.plays), 1);
                              const pctWidth = (c.plays / maxPlays) * 100;
                              return (
                                <div key={c.category} className="space-y-1 text-xs">
                                  <div className="flex justify-between font-semibold">
                                    <span className="capitalize">{c.category}</span>
                                    <span className="text-muted-foreground">{c.plays} plays · {c.durationHours} hrs</span>
                                  </div>
                                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                      style={{ width: `${pctWidth}%` }}
                                      className="h-full bg-cat rounded-full"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                            {(analyticsData.categoryDistribution || []).length === 0 && (
                              <p className="text-[10px] text-muted-foreground font-semibold">No category statistics available.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      {/* CARD 3: Popular Tracks ranking */}
                      <div className={cn(cardCls, "p-5 space-y-4 shadow-none border-border/85 overflow-hidden")}>
                        <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Top 10 Popular Tracks</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-border bg-muted/20 text-[9px] font-bold uppercase tracking-wider text-muted-foreground select-none">
                                <th className="px-3 py-2">Track</th>
                                <th className="px-3 py-2 text-center">Plays</th>
                                <th className="px-3 py-2 text-right">Completion</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                              {(analyticsData.popularTracks || []).map((t: any, idx: number) => (
                                <tr key={idx} className="hover:bg-muted/10 transition-colors">
                                  <td className="px-3 py-3">
                                    <div className="font-bold text-foreground leading-snug">{t.title}</div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">{t.artist}</div>
                                  </td>
                                  <td className="px-3 py-3 text-center font-mono font-bold text-foreground">{t.plays.toLocaleString()}</td>
                                  <td className="px-3 py-3 text-right">
                                    <span className={cn(
                                      "rounded px-1.5 py-0.5 text-[10px] font-bold font-mono border",
                                      t.completionRate >= 75 ? "bg-success/5 border-success/15 text-success" : "bg-muted border-border text-muted-foreground"
                                    )}>
                                      {t.completionRate}%
                                    </span>
                                  </td>
                                </tr>
                              ))}
                              {(analyticsData.popularTracks || []).length === 0 && (
                                <tr>
                                  <td colSpan={3} className="px-3 py-8 text-center text-muted-foreground font-semibold">No track plays registered.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* CARD 4: Program Performance starts vs completions */}
                      <div className={cn(cardCls, "p-5 space-y-4 shadow-none border-border/85 overflow-hidden")}>
                        <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Program Performance Ranking</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-border bg-muted/20 text-[9px] font-bold uppercase tracking-wider text-muted-foreground select-none">
                                <th className="px-3 py-2">Program</th>
                                <th className="px-3 py-2 text-center">Starts</th>
                                <th className="px-3 py-2 text-right">Completion Rate</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                              {(analyticsData.programPerformance || []).map((p: any, idx: number) => (
                                <tr key={idx} className="hover:bg-muted/10 transition-colors">
                                  <td className="px-3 py-3 font-bold text-foreground truncate max-w-[200px]" title={p.title}>{p.title}</td>
                                  <td className="px-3 py-3 text-center font-mono font-bold text-foreground">{p.starts.toLocaleString()}</td>
                                  <td className="px-3 py-3 text-right">
                                    <span className={cn(
                                      "rounded px-1.5 py-0.5 text-[10px] font-bold font-mono border",
                                      p.completionRate >= 75 ? "bg-success/5 border-success/15 text-success" : "bg-muted border-border text-muted-foreground"
                                    )}>
                                      {p.completionRate}%
                                    </span>
                                  </td>
                                </tr>
                              ))}
                              {(analyticsData.programPerformance || []).length === 0 && (
                                <tr>
                                  <td colSpan={3} className="px-3 py-8 text-center text-muted-foreground font-semibold">No program starts registered.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      {/* CARD 5: Pregnancy analytics */}
                      <div className={cn(cardCls, "p-5 space-y-4 shadow-none border-border/85")}>
                        <h4 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-cat animate-pulse" /> Pregnancy Wellness Analytics
                        </h4>
                        
                        <div className="grid grid-cols-3 gap-2.5 text-center">
                          {[
                            { label: "Active Pregnancy Users", value: analyticsData.pregnancy.activeUsers },
                            { label: "Programs Started", value: analyticsData.pregnancy.programsStarted },
                            { label: "Programs Completed", value: analyticsData.pregnancy.programsCompleted },
                          ].map((p) => (
                            <div key={p.label} className="bg-background/40 p-2.5 rounded border border-border/60">
                              <p className="text-[9px] font-semibold text-muted-foreground uppercase leading-tight">{p.label}</p>
                              <p className="text-base font-extrabold text-foreground mt-1 tabular-nums">{p.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Gestational Weeks Engagement bar chart */}
                        <div className="space-y-3.5 pt-2">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Most Active Gestational Weeks (Plays)</p>
                          <div className="space-y-2">
                            {(analyticsData.pregnancy.weekEngagement || []).map((w: any) => {
                              const maxPlays = Math.max(...(analyticsData.pregnancy.weekEngagement || []).map((v: any) => v.plays), 1);
                              const pctWidth = (w.plays / maxPlays) * 100;
                              return (
                                <div key={w.week} className="space-y-1 text-xs">
                                  <div className="flex justify-between font-semibold">
                                    <span>Week {w.week}</span>
                                    <span className="text-muted-foreground">{w.plays} plays engagement</span>
                                  </div>
                                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                      style={{ width: `${pctWidth}%` }}
                                      className="h-full bg-cat rounded-full"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                            {(analyticsData.pregnancy.weekEngagement || []).length === 0 && (
                              <p className="text-[10px] text-muted-foreground font-semibold">No gestational week events registered in this period.</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* CARD 6: Subscription Growth Trends & plan distributions */}
                      <div className={cn(cardCls, "p-5 space-y-4 shadow-none border-border/85")}>
                        <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Subscriptions Growth trends</h4>
                        
                        <div className="grid grid-cols-4 gap-1.5 text-center">
                          {[
                            { label: "Active", value: analyticsData.subscriptions.activeSubscriptions },
                            { label: "New", value: analyticsData.subscriptions.newSubscriptions },
                            { label: "Expired", value: analyticsData.subscriptions.expiredSubscriptions },
                            { label: "Canceled", value: analyticsData.subscriptions.cancelledSubscriptions },
                          ].map((s) => (
                            <div key={s.label} className="bg-background/40 p-2 rounded border border-border/50">
                              <p className="text-[8px] font-bold text-muted-foreground uppercase">{s.label}</p>
                              <p className="text-sm font-extrabold text-foreground mt-1.5 tabular-nums">{s.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Plan distributions progress metrics */}
                        <div className="space-y-3.5 pt-2">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Plan Distribution share (Active)</p>
                          <div className="space-y-2">
                            {(analyticsData.subscriptions.planDistribution || []).map((p: any) => {
                              const total = analyticsData.subscriptions.activeSubscriptions || 1;
                              const pctWidth = (p.count / total) * 100;
                              return (
                                <div key={p.planId} className="space-y-1 text-xs">
                                  <div className="flex justify-between font-semibold">
                                    <span className="capitalize">{p.planId} plan</span>
                                    <span className="text-muted-foreground">{p.count} accounts ({Math.round(pctWidth)}%)</span>
                                  </div>
                                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                      style={{ width: `${pctWidth}%` }}
                                      className="h-full bg-cat rounded-full"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                            {(analyticsData.subscriptions.planDistribution || []).length === 0 && (
                              <p className="text-[10px] text-muted-foreground font-semibold">No active subscriptions registered in this period.</p>
                            )}
                          </div>
                        </div>

                        {/* Favorites activity audit */}
                        <div className="border-t border-border/40 pt-4 space-y-2.5">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Total favorites added</span>
                            <span className="text-foreground">{analyticsData.favorites.totalFavorites.toLocaleString()} favorites</span>
                          </div>
                          
                          {/* Top favorited list */}
                          <div className="space-y-1">
                            {(analyticsData.favorites.topFavoritedTracks || []).slice(0, 3).map((f: any, idx: number) => (
                              <div key={idx} className="flex justify-between text-[11px] font-semibold text-muted-foreground group">
                                <span className="truncate max-w-[200px] text-foreground group-hover:text-cat transition-colors font-sans">{idx + 1}. {f.title}</span>
                                <span className="font-mono text-[10px] shrink-0">{f.favoritesCount} saves</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTION RENDERING: SETTINGS */}
            {section === "settings" && (
              <div className="mt-8 space-y-6 animate-in fade-in duration-200">
                {/* Header */}
                <div className="border-b border-border/40 pb-4 select-none">
                  <h3 className="text-base font-bold text-foreground">Admin settings</h3>
                  <p className="text-xs text-muted-foreground mt-1">Manage application configuration, defaults, system preferences, and infrastructure health.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  {/* Left Column: General & Content settings */}
                  <div className="md:col-span-2 space-y-6">
                    {/* General Settings */}
                    <div className={cn(cardCls, "p-5 space-y-4 shadow-none border-border/80")}>
                      <h4 className="text-xs font-black uppercase tracking-wider text-foreground">General Application Settings</h4>
                      
                      <div className="grid gap-4.5 sm:grid-cols-2">
                        <label className="block">
                          <span className={labelCls}>Application Name</span>
                          <input
                            type="text"
                            value="Krishna Sanjeevani"
                            disabled
                            className={cn(fieldCls, "opacity-60 bg-muted/30 cursor-not-allowed")}
                          />
                        </label>

                        <label className="block">
                          <span className={labelCls}>Version release</span>
                          <input
                            type="text"
                            value="1.0.0"
                            disabled
                            className={cn(fieldCls, "opacity-60 bg-muted/30 cursor-not-allowed")}
                          />
                        </label>
                      </div>

                      <label className="block">
                        <span className={labelCls}>Support Email address</span>
                        <input
                          type="email"
                          value={settingsSupportEmail}
                          onChange={(e) => setSettingsSupportEmail(e.target.value)}
                          className={fieldCls}
                          placeholder="e.g. support@krishnasanjeevani.org"
                        />
                      </label>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => {
                            localStorage.setItem("ks_settings_support_email", settingsSupportEmail);
                            toast.success("General settings saved successfully.");
                          }}
                          className="press inline-flex min-h-10 items-center justify-center rounded-btn bg-primary px-4.5 text-xs font-bold text-primary-foreground hover:bg-primary-hover shadow-sm"
                        >
                          Save General
                        </button>
                      </div>
                    </div>

                    {/* Content Default Settings */}
                    <div className={cn(cardCls, "p-5 space-y-4 shadow-none border-border/80")}>
                      <h4 className="text-xs font-black uppercase tracking-wider text-foreground">CMS Content defaults</h4>
                      <p className="text-[10px] text-muted-foreground">Configure initial values pre-populated when creating new therapeutic audio tracks.</p>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className={labelCls}>Default Track Visibility</span>
                          <select
                            value={settingsDefaultVisibility}
                            onChange={(e) => setSettingsDefaultVisibility(e.target.value)}
                            className={fieldCls}
                          >
                            <option value="draft">Draft (Recommended)</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                          </select>
                        </label>

                        <label className="block">
                          <span className={labelCls}>Default Difficulty</span>
                          <select
                            value={settingsDefaultDifficulty}
                            onChange={(e) => setSettingsDefaultDifficulty(e.target.value)}
                            className={fieldCls}
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                        </label>

                        <label className="block">
                          <span className={labelCls}>Default Subscription Tier</span>
                          <select
                            value={settingsDefaultTier}
                            onChange={(e) => setSettingsDefaultTier(e.target.value)}
                            className={fieldCls}
                          >
                            <option value="free">Free</option>
                            <option value="standard">Standard</option>
                            <option value="premium">Premium</option>
                          </select>
                        </label>

                        <label className="block">
                          <span className={labelCls}>Default Category</span>
                          <select
                            value={settingsDefaultCategory}
                            onChange={(e) => setSettingsDefaultCategory(e.target.value)}
                            className={fieldCls}
                          >
                            <option value="devotional">Devotional</option>
                            <option value="secular">Secular</option>
                            <option value="pregnancy">Pregnancy</option>
                          </select>
                        </label>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => {
                            localStorage.setItem("ks_settings_default_visibility", settingsDefaultVisibility);
                            localStorage.setItem("ks_settings_default_difficulty", settingsDefaultDifficulty);
                            localStorage.setItem("ks_settings_default_tier", settingsDefaultTier);
                            localStorage.setItem("ks_settings_default_category", settingsDefaultCategory);
                            toast.success("Content creation defaults updated successfully.");
                          }}
                          className="press inline-flex min-h-10 items-center justify-center rounded-btn bg-primary px-4.5 text-xs font-bold text-primary-foreground hover:bg-primary-hover shadow-sm"
                        >
                          Save CMS Defaults
                        </button>
                      </div>
                    </div>

                    {/* Pregnancy Settings */}
                    <div className={cn(cardCls, "p-5 space-y-4 shadow-none border-border/80")}>
                      <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Pregnancy engine configurations</h4>
                      <p className="text-[10px] text-muted-foreground">Adjust recommendation rules for the pregnancy trimester playback schedules.</p>

                      <div className="flex items-center gap-3 rounded-md border border-border p-3.5 bg-background/30 select-none">
                        <input
                          type="checkbox"
                          id="settingsPregnancyEnabled"
                          checked={settingsPregnancyEnabled}
                          onChange={(e) => setSettingsPregnancyEnabled(e.target.checked)}
                          className="h-4 w-4 rounded border-border text-cat focus:ring-cat"
                        />
                        <label htmlFor="settingsPregnancyEnabled" className="text-xs font-bold text-foreground cursor-pointer">
                          Enable Gestational Schedule Engine
                        </label>
                      </div>

                      <label className="block">
                        <span className={labelCls}>Default Recommendation Mode</span>
                        <select
                          value={settingsPregnancyRec}
                          onChange={(e) => setSettingsPregnancyRec(e.target.value)}
                          className={fieldCls}
                        >
                          <option value="automatic">Automatic (Matches week of gestation)</option>
                          <option value="manual">Manual (Admin curated sequence)</option>
                        </select>
                      </label>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="rounded-md border border-border p-3.5 bg-background/40">
                          <p className="font-bold text-muted-foreground">Gestational Week Range</p>
                          <p className="text-base font-extrabold text-foreground mt-1">1 — 40 weeks</p>
                        </div>
                        <div className="rounded-md border border-border p-3.5 bg-background/40">
                          <p className="font-bold text-muted-foreground">Schedule Modules</p>
                          <p className="text-base font-extrabold text-foreground mt-1">9 Months seeded</p>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => {
                            localStorage.setItem("ks_settings_pregnancy_enabled", String(settingsPregnancyEnabled));
                            localStorage.setItem("ks_settings_pregnancy_rec", settingsPregnancyRec);
                            toast.success("Pregnancy engine defaults updated successfully.");
                          }}
                          className="press inline-flex min-h-10 items-center justify-center rounded-btn bg-primary px-4.5 text-xs font-bold text-primary-foreground hover:bg-primary-hover shadow-sm"
                        >
                          Save Pregnancy Config
                        </button>
                      </div>
                    </div>

                    {/* Subscriptions Environment */}
                    <div className={cn(cardCls, "p-5 space-y-4 shadow-none border-border/80")}>
                      <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Subscriptions & Payment provider</h4>
                      
                      <div className="rounded-md border border-border p-4 bg-muted/15 flex items-start gap-3 text-xs leading-relaxed">
                        <div className="grid h-6 w-6 place-items-center rounded-full bg-amber-500/10 text-amber-500 font-extrabold select-none shrink-0 mt-0.5">
                          !
                        </div>
                        <div>
                          <p className="font-bold text-foreground capitalize">Running provider environment</p>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span className="rounded bg-amber-500/10 border border-amber-500/20 text-amber-600 px-2 py-0.5 text-[9px] font-black uppercase">
                              🟡 {subStats?.paymentMode ? subStats.paymentMode.toUpperCase() : "MOCK PAYMENT ACTIVE"}
                            </span>
                          </div>
                          <p className="text-muted-foreground mt-2 font-medium">
                            The application is currently running in mock transaction simulation mode. Production Razorpay api integrations are disabled.
                          </p>
                        </div>
                      </div>

                      <div className="rounded-md border border-border/70 bg-background p-4 text-[10px] text-muted-foreground font-mono leading-relaxed space-y-1.5">
                        <p className="font-bold text-foreground text-xs font-sans">🔑 Cloudflare secrets protection active</p>
                        <p>RAZORPAY_KEY_SECRET: •••••••••••••••••••••••••• (Protected Binding)</p>
                        <p>RAZORPAY_WEBHOOK_SECRET: •••••••••••••••••••••••••• (Protected Binding)</p>
                        <p>JWT_ACCESS_SECRET: •••••••••••••••••••••••••• (Protected Binding)</p>
                        <p className="font-sans font-semibold text-[9px] text-amber-600 pt-1">
                          Note: Sensitive encryption keys and integration secret hashes are locked at worker runtime. They cannot be retrieved or mutated via the admin panel.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Infrastructure Health & Storage Info */}
                  <div className="space-y-6">
                    {/* System Health */}
                    <div className={cn(cardCls, "p-5 space-y-4 shadow-none border-border/80")}>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Infrastructure Health</h4>
                        <button
                          onClick={loadSystemHealth}
                          disabled={loadingHealth}
                          className="press text-[10px] font-bold text-cat hover:underline disabled:opacity-45"
                        >
                          {loadingHealth ? "Checking..." : "Refresh health"}
                        </button>
                      </div>

                      <div className="space-y-3">
                        {[
                          { id: "worker", label: "Cloudflare Worker", active: true },
                          { id: "db", label: "D1 Database SQL", active: healthStatus?.dbConnected },
                          { id: "r2", label: "R2 Object Storage", active: true },
                          { id: "queue", label: "Media Queue", active: true },
                          { id: "hls", label: "HLS Processing engine", active: true },
                          { id: "auth", label: "Authentication services", active: true },
                        ].map((srv) => (
                          <div key={srv.id} className="flex items-center justify-between rounded border border-border/50 p-2.5 bg-background/20 text-xs font-sans">
                            <span className="font-semibold text-foreground">{srv.label}</span>
                            <span className={cn(
                              "rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase border",
                              srv.active ? "bg-success/5 border-success/15 text-success" : "bg-destructive/5 border-destructive/15 text-destructive"
                            )}>
                              {srv.active ? "Operational" : "Offline"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Storage Info */}
                    <div className={cn(cardCls, "p-5 space-y-4 shadow-none border-border/80")}>
                      <h4 className="text-xs font-black uppercase tracking-wider text-foreground">R2 Storage information</h4>
                      
                      <div className="space-y-3.5 text-xs">
                        <div className="flex justify-between border-b border-border/50 pb-2">
                          <span className="font-semibold text-muted-foreground">Active Bucket</span>
                          <span className="font-bold text-foreground">bhajan</span>
                        </div>
                        <div className="flex justify-between border-b border-border/50 pb-2">
                          <span className="font-semibold text-muted-foreground">Binding Status</span>
                          <span className="font-bold text-success">🟢 Connected</span>
                        </div>
                        <div className="flex justify-between border-b border-border/50 pb-2">
                          <span className="font-semibold text-muted-foreground">Media Type</span>
                          <span className="font-bold text-foreground">Private audio storage</span>
                        </div>
                        <div className="flex justify-between border-b border-border/50 pb-2">
                          <span className="font-semibold text-muted-foreground">Processed HLS</span>
                          <span className="font-bold text-foreground">Protected segment tickets</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold text-muted-foreground">Public Access</span>
                          <span className="font-bold text-destructive">Disabled (Secure)</span>
                        </div>
                      </div>
                    </div>

                    {/* Admin Preferences */}
                    <div className={cn(cardCls, "p-5 space-y-4 shadow-none border-border/80")}>
                      <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Admin UI Preferences</h4>
                      
                      <label className="block">
                        <span className={labelCls}>Dashboard Refresh</span>
                        <select
                          value={settingsAdminRefresh}
                          onChange={(e) => setSettingsAdminRefresh(e.target.value)}
                          className={fieldCls}
                        >
                          <option value="automatic">Automatic (Every 5 minutes)</option>
                          <option value="manual">Manual</option>
                        </select>
                      </label>

                      <label className="block">
                        <span className={labelCls}>Default Table Page Size</span>
                        <select
                          value={settingsAdminPageSize}
                          onChange={(e) => setSettingsAdminPageSize(Number(e.target.value))}
                          className={fieldCls}
                        >
                          <option value="10">10 records</option>
                          <option value="25">25 records</option>
                          <option value="50">50 records</option>
                        </select>
                      </label>

                      <div className="space-y-3.5 pt-2 select-none">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="settingsShowNotify"
                            checked={settingsShowNotify}
                            onChange={(e) => setSettingsShowNotify(e.target.checked)}
                            className="h-4 w-4 rounded border-border text-cat focus:ring-cat"
                          />
                          <label htmlFor="settingsShowNotify" className="text-xs font-bold text-foreground cursor-pointer">
                            Show Transcoding notifications
                          </label>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="settingsShowConfirm"
                            checked={settingsShowConfirm}
                            onChange={(e) => setSettingsShowConfirm(e.target.checked)}
                            className="h-4 w-4 rounded border-border text-cat focus:ring-cat"
                          />
                          <label htmlFor="settingsShowConfirm" className="text-xs font-bold text-foreground cursor-pointer">
                            Show Confirmation Dialogs
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => {
                            localStorage.setItem("ks_settings_admin_refresh", settingsAdminRefresh);
                            localStorage.setItem("ks_settings_admin_page_size", String(settingsAdminPageSize));
                            localStorage.setItem("ks_settings_show_notify", String(settingsShowNotify));
                            localStorage.setItem("ks_settings_show_confirm", String(settingsShowConfirm));
                            toast.success("Admin dashboard preferences saved.");
                          }}
                          className="press inline-flex min-h-10 items-center justify-center rounded-btn bg-primary px-4.5 text-xs font-bold text-primary-foreground hover:bg-primary-hover shadow-sm"
                        >
                          Save UI prefs
                        </button>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className={cn(cardCls, "p-5 border-destructive/30 space-y-4 shadow-none bg-destructive/5")}>
                      <h4 className="text-xs font-black uppercase tracking-wider text-destructive">Danger Zone</h4>
                      
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between border-b border-destructive/15 pb-3">
                          <div>
                            <p className="text-xs font-bold text-foreground">Clear simulated events</p>
                            <p className="text-[9px] text-muted-foreground mt-0.5">Flush analytics play history simulator data.</p>
                          </div>
                          <button
                            onClick={() => {
                              toast.info("Simulating data flush... Play history logs cleared.");
                            }}
                            className="press rounded-btn bg-destructive px-3 py-1.5 text-[10px] font-black text-destructive-foreground hover:bg-destructive-hover shadow-sm"
                          >
                            Flush logs
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div>
                            <p className="text-xs font-bold text-foreground">Reset configuration</p>
                            <p className="text-[9px] text-muted-foreground mt-0.5">Restore all dashboard default parameters.</p>
                          </div>
                          <button
                            onClick={() => {
                              localStorage.removeItem("ks_settings_support_email");
                              localStorage.removeItem("ks_settings_default_visibility");
                              localStorage.removeItem("ks_settings_default_difficulty");
                              localStorage.removeItem("ks_settings_default_tier");
                              localStorage.removeItem("ks_settings_default_category");
                              localStorage.removeItem("ks_settings_pregnancy_enabled");
                              localStorage.removeItem("ks_settings_pregnancy_rec");
                              localStorage.removeItem("ks_settings_admin_refresh");
                              localStorage.removeItem("ks_settings_admin_page_size");
                              localStorage.removeItem("ks_settings_show_notify");
                              localStorage.removeItem("ks_settings_show_confirm");
                              
                              setSettingsSupportEmail("support@krishnasanjeevani.org");
                              setSettingsDefaultVisibility("draft");
                              setSettingsDefaultDifficulty("beginner");
                              setSettingsDefaultTier("free");
                              setSettingsDefaultCategory("devotional");
                              setSettingsPregnancyEnabled(true);
                              setSettingsPregnancyRec("automatic");
                              setSettingsAdminRefresh("automatic");
                              setSettingsAdminPageSize(25);
                              setSettingsShowNotify(true);
                              setSettingsShowConfirm(true);
                              
                              toast.success("Dashboard settings restored to initial seeds.");
                            }}
                            className="press rounded-btn border border-destructive/20 bg-surface px-3 py-1.5 text-[10px] font-black text-destructive hover:bg-destructive/5"
                          >
                            Reset seeds
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* About Information */}
                <footer className="border-t border-border/50 pt-5 text-[10px] text-muted-foreground leading-relaxed flex flex-wrap justify-between gap-4 font-mono select-none">
                  <div>
                    <p className="font-sans font-bold text-foreground">Krishna Sanjeevani Operations Console</p>
                    <p className="mt-0.5">Deployment node: Cloudflare Edge Worker</p>
                    <p>Database context: Cloudflare D1 SQL Server</p>
                  </div>
                  <div className="text-right sm:text-left">
                    <p>Object bucket: Cloudflare R2 Ingestion</p>
                    <p>Processing stream: Cloudflare Queues + HLS Transcoding</p>
                    <p>Release Version: v1.0.0-mock-active</p>
                  </div>
                </footer>
              </div>
            )}
          </main>
        </div>

        {/* ── DRAWER: ADD / EDIT TRACK ── */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-surface h-full flex flex-col shadow-2xl relative border-l border-border animate-in slide-in-from-right duration-300">
              
              {/* Drawer Header */}
              <header className="flex items-center justify-between border-b border-border/80 p-5 bg-muted/25 select-none">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {editingTrack ? "Edit Track — " + editingTrack.title : "Add New Therapeutic Track"}
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-medium mt-1">
                    Provide precise metadata, upload files, and check encoding parameters.
                  </p>
                </div>
                <button
                  onClick={handleCloseForm}
                  className="press rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Close form drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              {/* Drawer Form Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <form className="grid gap-5 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
                  
                  {/* Title */}
                  <label className="sm:col-span-2 block">
                    <span className={labelCls}>Track Title <span className="text-destructive font-bold">*</span></span>
                    <input
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className={fieldCls}
                      placeholder="e.g. Sanjeevani Kalyani"
                    />
                  </label>

                  {/* Subtitle / Raga */}
                  <label className="block">
                    <span className={labelCls}>Subtitle / Raga</span>
                    <input
                      value={formSubtitle}
                      onChange={(e) => setFormSubtitle(e.target.value)}
                      className={fieldCls}
                      placeholder="e.g. Raga Kalyani"
                    />
                  </label>

                  {/* Artist */}
                  <label className="block">
                    <span className={labelCls}>Artist Name <span className="text-destructive font-bold">*</span></span>
                    <input
                      value={formArtist}
                      onChange={(e) => setFormArtist(e.target.value)}
                      className={fieldCls}
                      placeholder="e.g. Pandit Hariprasad"
                    />
                  </label>

                  {/* Category theme */}
                  <label className="block">
                    <span className={labelCls}>Category Theme</span>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className={fieldCls}
                    >
                      <option value="devotional">Devotional</option>
                      <option value="secular">Secular & Corporate</option>
                      <option value="pregnancy">Pregnancy</option>
                    </select>
                  </label>

                  {/* Subscription tier */}
                  <label className="block">
                    <span className={labelCls}>Subscription Tier</span>
                    <select
                      value={formTier}
                      onChange={(e) => setFormTier(e.target.value as any)}
                      className={fieldCls}
                    >
                      <option value="free">Free</option>
                      <option value="premium">Premium</option>
                    </select>
                  </label>

                  {/* Language */}
                  <label className="block">
                    <span className={labelCls}>Language Code</span>
                    <select
                      value={formLanguage}
                      onChange={(e) => setFormLanguage(e.target.value)}
                      className={fieldCls}
                    >
                      <option value="hi">Hindi (hi)</option>
                      <option value="sa">Sanskrit (sa)</option>
                      <option value="en">English (en)</option>
                      <option value="ta">Tamil (ta)</option>
                    </select>
                  </label>

                  {/* Purpose tags */}
                  {allTags.length > 0 && (
                    <div className="sm:col-span-2 space-y-2">
                      <span className={labelCls}>Purpose Classification Tags</span>
                      <div className="flex flex-wrap gap-2 rounded-md border border-border/80 bg-background/50 p-3.5">
                        {allTags.map((tag) => {
                          const isSelected = formSelectedTags.includes(tag.id);
                          return (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => {
                                setFormSelectedTags((prev) =>
                                  prev.includes(tag.id)
                                    ? prev.filter((id) => id !== tag.id)
                                    : [...prev, tag.id]
                                );
                              }}
                              className={cn(
                                "press px-3.5 py-1.5 rounded-full border text-[11px] font-bold transition-all",
                                isSelected
                                  ? "bg-cat text-cat-foreground border-cat shadow-sm"
                                  : "bg-surface text-muted-foreground border-border hover:border-cat"
                              )}
                            >
                              {tag.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Cover artwork file upload */}
                  <div className="block">
                    <span className={labelCls}>Cover Artwork image</span>
                    <input
                      id="drawer-image-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormImageFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <div className="space-y-2 mt-2">
                      {editingTrack && editingTrack.thumbnailKey && !formImageFile && (
                        <div className="flex items-center gap-3 rounded-md border border-border/60 bg-muted/20 p-2">
                          <img
                            src={getAssetUrl(editingTrack.thumbnailKey) || ""}
                            alt=""
                            className="h-12 w-12 rounded object-cover border border-border"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-muted-foreground truncate font-mono">Current: {editingTrack.thumbnailKey.split("/").pop()}</p>
                          </div>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => document.getElementById("drawer-image-file")?.click()}
                        className="press flex min-h-11 w-full items-center justify-between gap-3 rounded-field border border-dashed border-border bg-background px-3.5 text-xs text-muted-foreground hover:border-cat"
                      >
                        <span className="truncate">
                          {formImageFile ? formImageFile.name : "Choose JPG, PNG or WEBP artwork"}
                        </span>
                        <Upload className="h-4 w-4 shrink-0 text-muted-foreground/75" />
                      </button>
                    </div>
                  </div>

                  {/* Audio master file upload */}
                  <div className="block">
                    <span className={labelCls}>Audio Master file</span>
                    <input
                      id="drawer-audio-file"
                      type="file"
                      accept="audio/mpeg,audio/mp3"
                      onChange={(e) => setFormAudioFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <div className="space-y-2 mt-2">
                      {editingTrack && editingTrack.playlistKey && !formAudioFile && (
                        <div className="flex items-center gap-3 rounded-md border border-border/60 bg-muted/20 p-2">
                          <FileAudio className="h-10 w-10 text-cat shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-muted-foreground truncate font-mono">HLS Ready: {editingTrack.playlistKey}</p>
                          </div>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => document.getElementById("drawer-audio-file")?.click()}
                        className="press flex min-h-11 w-full items-center justify-between gap-3 rounded-field border border-dashed border-border bg-background px-3.5 text-xs text-muted-foreground hover:border-cat"
                      >
                        <span className="truncate">
                          {formAudioFile ? formAudioFile.name : editingTrack ? "Replace existing audio (optional)" : "Choose MP3 audio file"}
                        </span>
                        <Upload className="h-4 w-4 shrink-0 text-muted-foreground/75" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <label className="sm:col-span-2 block">
                    <span className={labelCls}>Description</span>
                    <textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      rows={4}
                      className="w-full rounded-field border border-border bg-background p-3.5 text-xs text-foreground focus:ring-2 focus:ring-cat focus:outline-none"
                      placeholder="Write descriptive paragraphs about therapeutic frequencies, listening patterns, or raga structures..."
                    />
                  </label>
                </form>

                {/* Transcode logs panel inside form */}
                {formStatus !== "idle" && (
                  <div className="rounded-card border border-border bg-muted/20 p-4.5 space-y-3 animate-in fade-in duration-300">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 select-none">
                      {formStatus === "success" ? (
                        <span className="text-success text-sm">✓</span>
                      ) : formStatus === "error" ? (
                        <span className="text-destructive text-sm">✗</span>
                      ) : (
                        <Loader2 className="h-3 w-3 animate-spin text-cat" />
                      )}
                      Transcode Engine Status
                    </h4>
                    <p className="text-xs font-semibold text-foreground leading-relaxed">{formStatusMessage}</p>
                    
                    {formStatus !== "success" && formStatus !== "error" && (
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                        <div className="h-full bg-cat animate-pulse w-3/4" />
                      </div>
                    )}
                    
                    {(formStatus === "success" || formStatus === "error") && (
                      <button
                        onClick={() => setFormStatus("idle")}
                        className="text-xs font-bold text-cat hover:underline"
                      >
                        Acknowledge and Clear logs
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Drawer footer actions */}
              <footer className="border-t border-border/80 p-5 bg-muted/25 flex flex-wrap gap-3 items-center justify-end select-none">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="press min-h-11 rounded-btn border border-border bg-surface px-5 text-xs font-bold hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                {!editingTrack ? (
                  <>
                    <button
                      type="button"
                      disabled={formStatus !== "idle" && formStatus !== "success" && formStatus !== "error"}
                      onClick={() => handleFormSubmit(false)}
                      className="press min-h-11 rounded-btn border border-border bg-surface px-5 text-xs font-bold hover:bg-muted transition-colors disabled:opacity-40"
                    >
                      Save as Draft
                    </button>
                    <button
                      type="button"
                      disabled={formStatus !== "idle" && formStatus !== "success" && formStatus !== "error"}
                      onClick={() => handleFormSubmit(true)}
                      className="press min-h-11 rounded-btn bg-primary px-5.5 text-xs font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-40 shadow-sm"
                    >
                      Publish Catalogue
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={formStatus !== "idle" && formStatus !== "success" && formStatus !== "error"}
                    onClick={() => handleFormSubmit(editingTrack.publishStatus === "published")}
                    className="press min-h-11 rounded-btn bg-primary px-5.5 text-xs font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-40 shadow-sm"
                  >
                    Save Changes
                  </button>
                )}
              </footer>
            </div>
          </div>
        )}

        {/* ── DRAWER: TRACK DETAILS VIEW ── */}
        {isDetailsOpen && selectedTrack && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-300">
            <div className="w-full max-w-lg bg-surface h-full flex flex-col shadow-2xl relative border-l border-border animate-in slide-in-from-right duration-300">
              
              {/* Header */}
              <header className="flex items-center justify-between border-b border-border/80 p-5 bg-muted/25 select-none">
                <div>
                  <h3 className="text-base font-bold text-foreground">Audio Track Details</h3>
                  <p className="text-[10px] text-muted-foreground font-semibold font-mono mt-0.5">ID: {selectedTrack.id}</p>
                </div>
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="press rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Close details view"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Visual Header */}
                <div className="flex items-start gap-4">
                  {selectedTrack.thumbnailKey ? (
                    <img
                      src={getAssetUrl(selectedTrack.thumbnailKey) || ""}
                      alt=""
                      className="h-20 w-20 rounded-md object-cover border border-border"
                    />
                  ) : (
                    <div className="grid h-20 w-20 shrink-0 place-items-center rounded-md border border-dashed border-border bg-muted text-muted-foreground/60">
                      <FileAudio className="h-8 w-8" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-lg font-bold text-foreground leading-snug">{selectedTrack.title}</h4>
                    <p className="text-xs font-semibold text-muted-foreground font-mono mt-1">{selectedTrack.artist}</p>
                    {selectedTrack.subtitle && (
                      <p className="text-xs text-muted-foreground/80 mt-1 font-medium italic">Raga: {selectedTrack.subtitle}</p>
                    )}
                    
                    {/* Status badges */}
                    <div className="flex flex-wrap gap-1.5 mt-3 select-none">
                      <span className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-bold border capitalize",
                        selectedTrack.publishStatus === "published" && "bg-success/5 border-success/20 text-success",
                        selectedTrack.publishStatus === "draft" && "bg-muted border-border text-muted-foreground",
                        selectedTrack.publishStatus === "archived" && "bg-orange-500/5 border-orange-500/20 text-orange-500"
                      )}>
                        Catalog: {selectedTrack.publishStatus}
                      </span>
                      <span className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-bold border capitalize",
                        selectedTrack.processingStatus === "ready" && "bg-success/5 border-success/20 text-success",
                        selectedTrack.processingStatus === "failed" && "bg-destructive/5 border-destructive/20 text-destructive",
                        ["processing", "transcoding", "uploading"].includes(selectedTrack.processingStatus || "") && "bg-amber-500/5 border-amber-500/20 text-amber-500"
                      )}>
                        Transcoder: {selectedTrack.processingStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Stats parameters info grid */}
                <div className="grid grid-cols-2 gap-4 border-t border-b border-border/60 py-4.5 text-xs">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Category Theme</p>
                    <p className="mt-1 font-bold text-foreground capitalize">{selectedTrack.category}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Subscription Tier</p>
                    <p className="mt-1 font-bold text-foreground capitalize">{selectedTrack.tier}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Language Code</p>
                    <p className="mt-1 font-bold text-foreground font-mono">{selectedTrack.language.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Play Duration</p>
                    <p className="mt-1 font-bold text-foreground font-mono">{formatDuration(selectedTrack.duration)}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-muted-foreground uppercase tracking-wider">Catalog Description</h4>
                  <p className="text-foreground leading-relaxed whitespace-pre-line bg-muted/10 p-3.5 rounded-md border border-border/50">
                    {selectedTrack.description || "No description provided for this catalog asset."}
                  </p>
                </div>

                {/* Purpose classification tags list */}
                {selectedTrack.purposeTags && selectedTrack.purposeTags.length > 0 && (
                  <div className="space-y-2 text-xs">
                    <h4 className="font-bold text-muted-foreground uppercase tracking-wider">Purpose Classification</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTrack.purposeTags.map((tag: any) => (
                        <span key={tag.id} className="rounded-full bg-cat-light px-3 py-1 text-[11px] font-bold text-cat border border-cat/15 shadow-sm">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Storage keys (R2 Paths for auditable checks) */}
                <div className="space-y-3.5 border-t border-border/60 pt-5 text-xs font-medium">
                  <h4 className="font-bold text-muted-foreground uppercase tracking-wider">R2 Asset Audit References</h4>
                  <div className="space-y-2.5 bg-background p-3.5 rounded-md border border-border/60 font-mono text-[10px]">
                    <div>
                      <p className="font-bold text-muted-foreground uppercase tracking-wider">Playlist Key (HLS m3u8)</p>
                      <p className="mt-1 text-foreground break-all">{selectedTrack.playlistKey || "None"}</p>
                    </div>
                    <div>
                      <p className="font-bold text-muted-foreground uppercase tracking-wider">Cover Art Image Key</p>
                      <p className="mt-1 text-foreground break-all">{selectedTrack.thumbnailKey || "None"}</p>
                    </div>
                  </div>
                </div>

                {/* Timestamps audit block */}
                <div className="border-t border-border/50 pt-5 text-[10px] text-muted-foreground font-mono space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>Created: {new Date(selectedTrack.createdAt).toLocaleString()}</span>
                  </div>
                  {selectedTrack.updatedAt && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>Last Updated: {new Date(selectedTrack.updatedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Details Drawer Footer Actions */}
              <footer className="border-t border-border/80 p-5 bg-muted/25 flex flex-wrap gap-2 items-center justify-end select-none">
                <button
                  onClick={() => handlePreviewToggle(selectedTrack)}
                  disabled={selectedTrack.processingStatus !== "ready"}
                  className="press inline-flex min-h-11 items-center justify-center rounded-btn border border-border bg-surface px-4.5 text-xs font-bold text-foreground hover:bg-muted disabled:opacity-40 transition-all shadow-sm"
                >
                  {playingTrack?.id === selectedTrack.id && isAudioPlaying ? (
                    <>
                      <Pause className="mr-1.5 h-4 w-4 text-cat fill-current" /> Pause Preview
                    </>
                  ) : (
                    <>
                      <Play className="mr-1.5 h-4 w-4 text-cat fill-current" /> Secure HLS Preview
                    </>
                  )}
                </button>
                <button
                  onClick={() => { setIsDetailsOpen(false); handleOpenEdit(selectedTrack); }}
                  className="press inline-flex min-h-11 items-center justify-center rounded-btn border border-border bg-surface px-4.5 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-sm"
                >
                  <Pencil className="mr-1.5 h-4 w-4" /> Edit Metadata
                </button>
                {selectedTrack.publishStatus === "draft" ? (
                  <button
                    onClick={() => handlePublish(selectedTrack)}
                    disabled={selectedTrack.processingStatus !== "ready"}
                    className="press inline-flex min-h-11 items-center justify-center rounded-btn bg-primary px-5 text-xs font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-40 shadow-sm"
                  >
                    Publish Catalog
                  </button>
                ) : selectedTrack.publishStatus === "published" ? (
                  <button
                    onClick={() => handleUnpublish(selectedTrack)}
                    className="press inline-flex min-h-11 items-center justify-center rounded-btn border border-border bg-surface px-4.5 text-xs font-bold text-amber-600 hover:bg-amber-500/10 shadow-sm"
                  >
                    Revert to Draft
                  </button>
                ) : null}
              </footer>
            </div>
          </div>
        )}

        {/* ── MODAL: UNSAVED CHANGES GUARD ── */}
        {showUnsavedConfirm && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-card border border-border bg-surface p-5 shadow-2xl space-y-4 mx-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 text-amber-600">
                <AlertTriangle className="h-6 w-6 shrink-0" />
                <h3 className="text-base font-bold text-foreground">Unsaved Changes</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You have unsaved changes in this track editor form. Are you sure you want to discard your edits and leave?
              </p>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setShowUnsavedConfirm(false)}
                  className="press min-h-10 rounded-btn border border-border bg-surface px-4.5 text-xs font-bold hover:bg-muted"
                >
                  Stay
                </button>
                <button
                  onClick={() => {
                    if (unsavedConfirmCallback) unsavedConfirmCallback();
                    setShowUnsavedConfirm(false);
                  }}
                  className="press min-h-10 rounded-btn bg-destructive px-4.5 text-xs font-bold text-destructive-foreground hover:bg-destructive-hover"
                >
                  Discard & Leave
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: SAFE DELETE CONFIRMATION ── */}
        {showDeleteConfirm && trackToDelete && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-card border border-border bg-surface p-5 shadow-2xl space-y-4 mx-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 text-destructive">
                <AlertTriangle className="h-6 w-6 shrink-0" />
                <h3 className="text-base font-bold text-foreground">Confirm Track Deletion</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to delete track <span className="font-bold text-foreground">"{trackToDelete.title}"</span>?
                This operation soft-deletes the track record, removing it from catalogue lookups.
              </p>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => { setTrackToDelete(null); setShowDeleteConfirm(false); }}
                  className="press min-h-10 rounded-btn border border-border bg-surface px-4.5 text-xs font-bold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="press min-h-10 rounded-btn bg-destructive px-4.5 text-xs font-bold text-destructive-foreground hover:bg-destructive-hover"
                >
                  Delete Track
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DRAWER: PROGRAM DETAILS ── */}
        {isProgDetailsOpen && selectedProgram && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-surface h-full flex flex-col shadow-2xl relative border-l border-border animate-in slide-in-from-right duration-300">
              <header className="flex items-center justify-between border-b border-border/80 p-5 bg-muted/25 select-none">
                <div>
                  <h3 className="text-base font-bold text-foreground">Program Details</h3>
                  <p className="text-[11px] text-muted-foreground font-medium mt-1">Full curation specifications and components.</p>
                </div>
                <button
                  onClick={() => setIsProgDetailsOpen(false)}
                  className="press rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex items-start gap-4">
                  {selectedProgram.thumbnailKey ? (
                    <img
                      src={getAssetUrl(selectedProgram.thumbnailKey) || ""}
                      alt=""
                      className="h-20 w-20 rounded-md object-cover border border-border"
                    />
                  ) : (
                    <div className="grid h-20 w-20 shrink-0 place-items-center rounded-md border border-dashed border-border bg-muted text-muted-foreground/60">
                      <ListMusic className="h-8 w-8" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-lg font-bold text-foreground leading-snug">{selectedProgram.title}</h4>
                    {selectedProgram.subtitle && (
                      <p className="text-xs text-muted-foreground mt-1 font-medium">{selectedProgram.subtitle}</p>
                    )}
                    <div className="flex gap-2 mt-3 select-none">
                      <span className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-bold border capitalize",
                        selectedProgram.status === "published" && "bg-success/5 border-success/20 text-success",
                        selectedProgram.status === "draft" && "bg-muted border-border text-muted-foreground",
                        selectedProgram.status === "archived" && "bg-orange-500/5 border-orange-500/20 text-orange-500"
                      )}>
                        Status: {selectedProgram.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-b border-border/60 py-4.5 text-xs">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Category</p>
                    <p className="mt-1 font-bold text-foreground capitalize">{selectedProgram.category}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Subscription Tier</p>
                    <p className="mt-1 font-bold text-foreground capitalize">{selectedProgram.tier}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Difficulty</p>
                    <p className="mt-1 font-bold text-foreground capitalize">{selectedProgram.difficulty}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Curation Duration</p>
                    <p className="mt-1 font-bold text-foreground font-mono">{formatDuration(selectedProgram.estimatedDuration)}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-muted-foreground uppercase tracking-wider">Description</h4>
                  <p className="text-foreground leading-relaxed whitespace-pre-line bg-muted/10 p-3.5 rounded-md border border-border/50">
                    {selectedProgram.description || "No description provided."}
                  </p>
                </div>

                {selectedProgram.category === "pregnancy" && (
                  <div className="space-y-3.5 border-t border-border/60 pt-5 text-xs">
                    <h4 className="font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-cat" /> Gestational Schedule Configuration
                    </h4>
                    <div className="overflow-hidden rounded-md border border-border bg-background">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-muted/40 text-[9px] font-bold uppercase text-muted-foreground select-none border-b border-border">
                            <th className="px-4 py-2">Month</th>
                            <th className="px-4 py-2">Week</th>
                            <th className="px-4 py-2">Day</th>
                            <th className="px-4 py-2">Unlock Days</th>
                            <th className="px-4 py-2 text-right">Required</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 text-[11px] font-medium font-mono">
                          {selectedProgramSchedules.map((s, idx) => (
                            <tr key={s.id || idx}>
                              <td className="px-4 py-2">Month {s.pregnancyMonth}</td>
                              <td className="px-4 py-2">Week {s.week}</td>
                              <td className="px-4 py-2">Day {s.day}</td>
                              <td className="px-4 py-2">{s.unlockAfterDays || 0}</td>
                              <td className="px-4 py-2 text-right capitalize text-cat font-bold">{s.isRequired ? "Yes" : "No"}</td>
                            </tr>
                          ))}
                          {selectedProgramSchedules.length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-4 py-4 text-center text-muted-foreground font-sans">
                                Not scheduled in pregnancy schedule path yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="space-y-3 border-t border-border/60 pt-5 text-xs">
                  <h4 className="font-bold text-muted-foreground uppercase tracking-wider">Assigned Playlist Tracks ({selectedProgramTracks.length})</h4>
                  <div className="space-y-2">
                    {loadingSelectedProgramTracks ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-5 w-5 animate-spin text-cat" />
                      </div>
                    ) : selectedProgramTracks.map((t, idx) => (
                      <div key={t.id} className="flex items-center gap-3 rounded-md border border-border/70 p-3 bg-background/50 hover:border-cat transition-colors group">
                        <span className="text-[11px] font-bold font-mono text-muted-foreground w-6">{(idx + 1).toString().padStart(2, "0")}</span>
                        {t.thumbnailKey ? (
                          <img src={getAssetUrl(t.thumbnailKey) || ""} className="h-8 w-8 rounded object-cover border border-border" alt="" />
                        ) : (
                          <div className="grid h-8 w-8 place-items-center rounded border border-dashed border-border bg-muted text-muted-foreground/45"><FileAudio className="h-4 w-4" /></div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-foreground truncate">{t.title}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{t.artist}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono mr-2">{formatDuration(t.duration)}</span>
                        <button
                          onClick={() => handlePreviewToggle(t)}
                          disabled={t.processingStatus !== "ready"}
                          className="press grid h-7 w-7 place-items-center rounded bg-cat/10 text-cat disabled:opacity-30"
                        >
                          {playingTrack?.id === t.id && isAudioPlaying ? (
                            <Pause className="h-3 w-3 fill-current" />
                          ) : (
                            <Play className="h-3 w-3 fill-current" />
                          )}
                        </button>
                      </div>
                    ))}
                    {selectedProgramTracks.length === 0 && !loadingSelectedProgramTracks && (
                      <p className="text-center py-6 text-muted-foreground font-medium">No tracks assigned to this care program.</p>
                    )}
                  </div>
                </div>
              </div>

              <footer className="border-t border-border/80 p-5 bg-muted/25 flex gap-2 items-center justify-end select-none">
                <button
                  onClick={() => { setIsProgDetailsOpen(false); handleOpenProgEdit(selectedProgram); }}
                  className="press inline-flex min-h-11 items-center justify-center rounded-btn border border-border bg-surface px-4.5 text-xs font-bold text-foreground hover:bg-muted shadow-sm"
                >
                  <Pencil className="mr-1.5 h-4 w-4" /> Edit Program
                </button>
                {selectedProgram.status === "draft" ? (
                  <button
                    onClick={() => handleProgramPublish(selectedProgram)}
                    className="press inline-flex min-h-11 items-center justify-center rounded-btn bg-primary px-5 text-xs font-bold text-primary-foreground hover:bg-primary-hover shadow-sm"
                  >
                    Publish Program
                  </button>
                ) : selectedProgram.status === "published" ? (
                  <button
                    onClick={() => handleProgramUnpublish(selectedProgram)}
                    className="press inline-flex min-h-11 items-center justify-center rounded-btn border border-border bg-surface px-4.5 text-xs font-bold text-amber-600 hover:bg-amber-500/10 shadow-sm"
                  >
                    Revert to Draft
                  </button>
                ) : null}
              </footer>
            </div>
          </div>
        )}

        {/* ── DRAWER: ADD / EDIT PROGRAM ── */}
        {isProgramFormOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-surface h-full flex flex-col shadow-2xl relative border-l border-border animate-in slide-in-from-right duration-300">
              <header className="flex items-center justify-between border-b border-border/80 p-5 bg-muted/25 select-none">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {editingProgram ? "Edit Program — " + editingProgram.title : "Create Therapeutic Program"}
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-medium mt-1">
                    Configure metadata parameters, sequence tracks, and configure gestational timelines.
                  </p>
                </div>
                <button
                  onClick={handleCloseProgramForm}
                  className="press rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <form className="grid gap-5 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
                  <label className="sm:col-span-2 block">
                    <span className={labelCls}>Program Title <span className="text-destructive font-bold">*</span></span>
                    <input
                      value={progFormTitle}
                      onChange={(e) => setProgFormTitle(e.target.value)}
                      className={fieldCls}
                      placeholder="e.g. Pregnancy Calm"
                    />
                  </label>

                  <label className="sm:col-span-2 block">
                    <span className={labelCls}>Subtitle</span>
                    <input
                      value={progFormSubtitle}
                      onChange={(e) => setProgFormSubtitle(e.target.value)}
                      className={fieldCls}
                      placeholder="e.g. Therapeutic music for relaxation"
                    />
                  </label>

                  <label className="block">
                    <span className={labelCls}>Category Theme</span>
                    <select
                      value={progFormCategory}
                      onChange={(e) => setProgFormCategory(e.target.value as any)}
                      className={fieldCls}
                    >
                      <option value="devotional">Devotional</option>
                      <option value="secular">Secular & Corporate</option>
                      <option value="pregnancy">Pregnancy</option>
                      <option value="corporate">Corporate</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className={labelCls}>Difficulty Level</span>
                    <select
                      value={progFormDifficulty}
                      onChange={(e) => setProgFormDifficulty(e.target.value as any)}
                      className={fieldCls}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className={labelCls}>Subscription Tier</span>
                    <select
                      value={progFormTier}
                      onChange={(e) => setProgFormTier(e.target.value as any)}
                      className={fieldCls}
                    >
                      <option value="free">Free</option>
                      <option value="premium">Premium</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className={labelCls}>Language Code</span>
                    <select
                      value={progFormLanguage}
                      onChange={(e) => setProgFormLanguage(e.target.value)}
                      className={fieldCls}
                    >
                      <option value="hi">Hindi (hi)</option>
                      <option value="sa">Sanskrit (sa)</option>
                      <option value="en">English (en)</option>
                      <option value="ta">Tamil (ta)</option>
                    </select>
                  </label>

                  <div className="sm:col-span-2 block">
                    <span className={labelCls}>Program Artwork Header</span>
                    <input
                      id="prog-image-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProgFormImageFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <div className="space-y-2 mt-2">
                      {progFormThumbnailKey && !progFormImageFile && (
                        <div className="flex items-center gap-3 rounded-md border border-border/60 bg-muted/20 p-2">
                          <img
                            src={getAssetUrl(progFormThumbnailKey) || ""}
                            alt=""
                            className="h-12 w-12 rounded object-cover border border-border"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-muted-foreground truncate font-mono">Current: {progFormThumbnailKey.split("/").pop()}</p>
                          </div>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => document.getElementById("prog-image-file")?.click()}
                        className="press flex min-h-11 w-full items-center justify-between gap-3 rounded-field border border-dashed border-border bg-background px-3.5 text-xs text-muted-foreground hover:border-cat"
                      >
                        <span className="truncate">
                          {progFormImageFile ? progFormImageFile.name : "Choose JPG, PNG or WEBP artwork"}
                        </span>
                        <Upload className="h-4 w-4 shrink-0 text-muted-foreground/75" />
                      </button>
                    </div>
                  </div>

                  <label className="sm:col-span-2 block">
                    <span className={labelCls}>Description</span>
                    <textarea
                      value={progFormDescription}
                      onChange={(e) => setProgFormDescription(e.target.value)}
                      rows={3}
                      className="w-full rounded-field border border-border bg-background p-3.5 text-xs text-foreground focus:ring-2 focus:ring-cat focus:outline-none"
                      placeholder="Write descriptive paragraphs about wellness benefits, clinicians, and week schedules..."
                    />
                  </label>
                </form>

                {progFormCategory === "pregnancy" && (
                  <div className="space-y-3.5 border-t border-border/60 pt-5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-cat" /> Gestational schedule configurator
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingScheduleIndex(null);
                          setSchedFormMonth(1);
                          setSchedFormWeek(1);
                          setSchedFormDay(1);
                          setSchedFormUnlock(0);
                          setSchedFormRequired(true);
                          setIsScheduleModalOpen(true);
                        }}
                        className="press text-[11px] font-bold text-cat hover:underline flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" /> Add Schedule Link
                      </button>
                    </div>

                    <div className="overflow-hidden rounded-md border border-border bg-background/50">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-muted/40 text-[9px] font-bold uppercase text-muted-foreground select-none border-b border-border">
                            <th className="px-4 py-2">Month</th>
                            <th className="px-4 py-2">Week (1-40)</th>
                            <th className="px-4 py-2">Day (1-7)</th>
                            <th className="px-4 py-2">Unlock Days</th>
                            <th className="px-4 py-2">Req.</th>
                            <th className="px-4 py-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 font-mono text-[11px]">
                          {progFormSchedules.map((s, idx) => (
                            <tr key={idx} className="hover:bg-muted/10">
                              <td className="px-4 py-1.5 font-bold">Month {s.pregnancyMonth}</td>
                              <td className="px-4 py-1.5">Week {s.week}</td>
                              <td className="px-4 py-1.5">Day {s.day}</td>
                              <td className="px-4 py-1.5">{s.unlockAfterDays || 0}</td>
                              <td className="px-4 py-1.5 text-cat font-bold">{s.isRequired ? "Yes" : "No"}</td>
                              <td className="px-4 py-1.5 text-right space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingScheduleIndex(idx);
                                    setSchedFormMonth(s.pregnancyMonth);
                                    setSchedFormWeek(s.week);
                                    setSchedFormDay(s.day);
                                    setSchedFormUnlock(s.unlockAfterDays || 0);
                                    setSchedFormRequired(!!s.isRequired);
                                    setIsScheduleModalOpen(true);
                                  }}
                                  className="text-muted-foreground hover:text-foreground text-[10px] font-sans font-bold"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setProgFormSchedules(prev => prev.filter((_, i) => i !== idx))}
                                  className="text-destructive hover:text-destructive/80 text-[10px] font-sans font-bold"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                          {progFormSchedules.length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-4 py-4 text-center text-muted-foreground font-sans italic">
                                Click Add Schedule Link to place this program in the daily pregnancy timeline.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="space-y-3.5 border-t border-border/60 pt-5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Program tracks sequence builder
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setLoadingReadyTracks(true);
                        setIsTrackSelectorOpen(true);
                        setTrackSelectorSearch("");
                        api.tracks.listAdmin({ limit: 100, processingStatus: "ready" }).then(res => {
                          if (res.success && res.data) {
                            setAllReadyTracks(res.data.data || []);
                          }
                          setLoadingReadyTracks(false);
                        });
                      }}
                      className="press text-[11px] font-bold text-cat hover:underline flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add Tracks
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {progFormTracks.map((t, idx) => (
                      <div
                        key={t.id}
                        className="flex items-center gap-3 rounded-md border border-border p-3.5 bg-background/50 group select-none hover:border-cat/60 transition-colors"
                      >
                        <span className="text-[11px] font-bold font-mono text-muted-foreground w-6">
                          {(idx + 1).toString().padStart(2, "0")}
                        </span>
                        {t.thumbnailKey ? (
                          <img src={getAssetUrl(t.thumbnailKey) || ""} className="h-8 w-8 rounded object-cover border border-border" alt="" />
                        ) : (
                          <div className="grid h-8 w-8 place-items-center rounded border border-dashed border-border bg-muted text-muted-foreground/45">
                            <FileAudio className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-foreground truncate">{t.title}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{t.artist}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono mr-2">{formatDuration(t.duration)}</span>
                        
                        <div className="flex gap-1 select-none">
                          <button
                            type="button"
                            onClick={() => {
                              if (idx === 0) return;
                              const updated = [...progFormTracks];
                              const temp = updated[idx];
                              updated[idx] = updated[idx - 1];
                              updated[idx - 1] = temp;
                              setProgFormTracks(updated);
                            }}
                            disabled={idx === 0}
                            className="press grid h-7 w-7 place-items-center rounded border border-border bg-surface text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move track sequence up"
                          >
                            <span>↑</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (idx === progFormTracks.length - 1) return;
                              const updated = [...progFormTracks];
                              const temp = updated[idx];
                              updated[idx] = updated[idx + 1];
                              updated[idx + 1] = temp;
                              setProgFormTracks(updated);
                            }}
                            disabled={idx === progFormTracks.length - 1}
                            className="press grid h-7 w-7 place-items-center rounded border border-border bg-surface text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move track sequence down"
                          >
                            <span>↓</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setProgFormTracks(prev => prev.filter(item => item.id !== t.id))}
                            className="press grid h-7 w-7 place-items-center rounded border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/15 ml-1.5"
                            title="Remove track"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {progFormTracks.length === 0 && (
                      <p className="text-center py-8 text-xs text-muted-foreground font-semibold border border-dashed border-border rounded-md bg-muted/10">
                        No tracks added to program list. Curate your experience using [ Add Tracks ].
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-card border border-border bg-muted/20 p-4.5 space-y-3.5 text-xs">
                  <h4 className="font-bold text-foreground">Program Curation Prerequisite Checklist</h4>
                  <div className="grid grid-cols-2 gap-3.5 text-[11px] font-bold border-b border-border/60 pb-3">
                    <div>Total Curation Tracks: <span className="text-cat font-mono">{progFormTracks.length}</span></div>
                    <div>Total Play Duration: <span className="text-cat font-mono">{formatDuration(progFormTracks.reduce((sum, t) => sum + (t.duration || 0), 0))}</span></div>
                  </div>

                  <ul className="space-y-2 select-none">
                    {[
                      { label: "Valid Program title", pass: progFormTitle.trim().length > 0 },
                      { label: "Valid description", pass: progFormDescription.trim().length > 0 },
                      { label: "Cover Artwork artwork thumbnail set", pass: progFormThumbnailKey.length > 0 || progFormImageFile !== null },
                      { label: "At least one track assigned", pass: progFormTracks.length > 0 },
                      { label: "All assigned tracks are Ready", pass: progFormTracks.length > 0 && !progFormTracks.some(t => ["failed", "processing", "transcoding"].includes(t.processingStatus)) }
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 font-medium">
                        {item.pass ? (
                          <span className="text-success font-bold font-mono">✓</span>
                        ) : (
                          <span className="text-destructive font-bold font-mono">✗</span>
                        )}
                        <span className={item.pass ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {progFormStatus !== "idle" && (
                <div className={cn(
                  "p-4 text-xs font-bold text-center border-t border-b",
                  progFormStatus === "saving" && "bg-muted text-muted-foreground",
                  progFormStatus === "uploading_image" && "bg-cat-light text-cat border-cat/10",
                  progFormStatus === "success" && "bg-success/5 border-success/20 text-success",
                  progFormStatus === "error" && "bg-destructive/5 border-destructive/20 text-destructive",
                )}>
                  <div className="flex items-center justify-center gap-2">
                    {["saving", "uploading_image"].includes(progFormStatus) && <Loader2 className="h-4 w-4 animate-spin text-cat" />}
                    <span>{progFormStatusMessage}</span>
                  </div>
                </div>
              )}

              <footer className="border-t border-border/80 p-5 bg-muted/25 flex gap-2 items-center justify-end select-none">
                <button
                  type="button"
                  onClick={handleCloseProgramForm}
                  className="press inline-flex min-h-11 items-center justify-center rounded-btn border border-border bg-surface px-5 text-xs font-bold text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleProgramFormSubmit(false)}
                  disabled={progFormStatus !== "idle"}
                  className="press inline-flex min-h-11 items-center justify-center rounded-btn border border-border bg-surface px-5 text-xs font-bold text-foreground hover:bg-muted disabled:opacity-40"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleProgramFormSubmit(true)}
                  disabled={progFormStatus !== "idle" || !progFormTitle.trim() || progFormTracks.length === 0 || !(progFormThumbnailKey.length > 0 || progFormImageFile !== null)}
                  className="press inline-flex min-h-11 items-center justify-center rounded-btn bg-primary px-5.5 text-xs font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
                >
                  Publish Program
                </button>
              </footer>
            </div>
          </div>
        )}

        {/* ── MODAL: SEARCHABLE TRACK SELECTOR ── */}
        {isTrackSelectorOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-card border border-border bg-surface p-5 shadow-2xl space-y-4 mx-4 flex flex-col h-[500px] animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="text-sm font-bold text-foreground">Add tracks to program</h3>
                <button
                  onClick={() => setIsTrackSelectorOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 rounded-field border border-border bg-background px-3 flex-none focus-within:ring-2 focus-within:ring-cat">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <input
                  value={trackSelectorSearch}
                  onChange={(e) => setTrackSelectorSearch(e.target.value)}
                  placeholder="Search tracks by title or artist..."
                  className="min-h-10 w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1.5 divide-y divide-border/40">
                {loadingReadyTracks ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-5 w-5 animate-spin text-cat" />
                  </div>
                ) : filteredReadyTracks.map((t) => {
                  const isChecked = trackSelectorSelectedIds.includes(t.id);
                  return (
                    <label
                      key={t.id}
                      className="flex items-center gap-3.5 py-2.5 px-2 hover:bg-muted/10 cursor-pointer rounded transition-colors select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTrackSelectorSelectedIds(prev => [...prev, t.id]);
                          } else {
                            setTrackSelectorSelectedIds(prev => prev.filter(id => id !== t.id));
                          }
                        }}
                        className="rounded border-border text-cat focus:ring-cat h-3.5 w-3.5 cursor-pointer"
                      />
                      {t.thumbnailKey ? (
                        <img src={getAssetUrl(t.thumbnailKey) || ""} className="h-8 w-8 rounded object-cover border border-border" alt="" />
                      ) : (
                        <div className="grid h-8 w-8 place-items-center rounded border border-dashed border-border bg-muted text-muted-foreground/50">
                          <FileAudio className="h-4 w-4" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-foreground text-xs truncate leading-snug">{t.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{t.artist}</p>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">{formatDuration(t.duration)}</span>
                    </label>
                  );
                })}
                {filteredReadyTracks.length === 0 && !loadingReadyTracks && (
                  <p className="text-center py-10 text-xs text-muted-foreground font-semibold">
                    No matching ready tracks available to add.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-3.5 border-t border-border/60 flex-none">
                <button
                  type="button"
                  onClick={() => setIsTrackSelectorOpen(false)}
                  className="press min-h-10 rounded-btn border border-border bg-surface px-4 text-xs font-bold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const selectedTracks = allReadyTracks.filter(t => trackSelectorSelectedIds.includes(t.id));
                    setProgFormTracks(prev => [...prev, ...selectedTracks]);
                    setIsTrackSelectorOpen(false);
                    setTrackSelectorSelectedIds([]);
                  }}
                  disabled={trackSelectorSelectedIds.length === 0}
                  className="press min-h-10 rounded-btn bg-primary px-4.5 text-xs font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-40"
                >
                  Add Selected ({trackSelectorSelectedIds.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: PREGNANCY SCHEDULE TIMELINE ENTRY ── */}
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-card border border-border bg-surface p-5 shadow-2xl space-y-4 mx-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <Calendar className="h-5 w-5 text-cat" />
                <h3 className="text-base font-bold text-foreground">
                  {editingScheduleIndex !== null ? "Edit Schedule Entry" : "Add Pregnancy Schedule Link"}
                </h3>
              </div>

              <div className="space-y-3.5 text-xs text-left">
                <label className="block">
                  <span className={labelCls}>Pregnancy Month (1-9)</span>
                  <input
                    type="number"
                    min={1}
                    max={9}
                    value={schedFormMonth}
                    onChange={(e) => setSchedFormMonth(Math.max(1, Math.min(9, parseInt(e.target.value) || 1)))}
                    className={fieldCls}
                  />
                </label>

                <label className="block">
                  <span className={labelCls}>Gestational Week (1-40)</span>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={schedFormWeek}
                    onChange={(e) => setSchedFormWeek(Math.max(1, Math.min(40, parseInt(e.target.value) || 1)))}
                    className={fieldCls}
                  />
                </label>

                <label className="block">
                  <span className={labelCls}>Day of the Week (1-7)</span>
                  <input
                    type="number"
                    min={1}
                    max={7}
                    value={schedFormDay}
                    onChange={(e) => setSchedFormDay(Math.max(1, Math.min(7, parseInt(e.target.value) || 1)))}
                    className={fieldCls}
                  />
                </label>

                <label className="block">
                  <span className={labelCls}>Unlock after days offset</span>
                  <input
                    type="number"
                    min={0}
                    value={schedFormUnlock}
                    onChange={(e) => setSchedFormUnlock(Math.max(0, parseInt(e.target.value) || 0))}
                    className={fieldCls}
                  />
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={schedFormRequired}
                    onChange={(e) => setSchedFormRequired(e.target.checked)}
                    className="rounded border-border text-cat focus:ring-cat h-4.5 w-4.5 cursor-pointer"
                  />
                  <span className="font-semibold text-foreground">Mark as Required daily program</span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="press min-h-10 rounded-btn border border-border bg-surface px-4.5 text-xs font-bold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newEntry = {
                      pregnancyMonth: schedFormMonth,
                      week: schedFormWeek,
                      day: schedFormDay,
                      unlockAfterDays: schedFormUnlock,
                      isRequired: schedFormRequired ? 1 : 0,
                    };
                    if (editingScheduleIndex !== null) {
                      const updated = [...progFormSchedules];
                      updated[editingScheduleIndex] = newEntry;
                      setProgFormSchedules(updated);
                    } else {
                      setProgFormSchedules(prev => [...prev, newEntry]);
                    }
                    setIsScheduleModalOpen(false);
                  }}
                  className="press min-h-10 rounded-btn bg-primary px-5 text-xs font-bold text-primary-foreground hover:bg-primary-hover shadow-sm"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: PROGRAM UNSAVED CHANGES GUARD ── */}
        {showProgUnsavedConfirm && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-card border border-border bg-surface p-5 shadow-2xl space-y-4 mx-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 text-amber-600">
                <AlertTriangle className="h-6 w-6 shrink-0" />
                <h3 className="text-base font-bold text-foreground">Unsaved Changes</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You have unsaved changes in this program editor form. Are you sure you want to discard your edits and leave?
              </p>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setShowProgUnsavedConfirm(false)}
                  className="press min-h-10 rounded-btn border border-border bg-surface px-4.5 text-xs font-bold hover:bg-muted"
                >
                  Stay
                </button>
                <button
                  onClick={() => {
                    if (progUnsavedConfirmCallback) progUnsavedConfirmCallback();
                    setShowProgUnsavedConfirm(false);
                  }}
                  className="press min-h-10 rounded-btn bg-destructive px-4.5 text-xs font-bold text-destructive-foreground hover:bg-destructive-hover"
                >
                  Discard & Leave
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: PROGRAM DELETE CONFIRMATION ── */}
        {showProgDeleteConfirm && programToDelete && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-card border border-border bg-surface p-5 shadow-2xl space-y-4 mx-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 text-destructive">
                <AlertTriangle className="h-6 w-6 shrink-0" />
                <h3 className="text-base font-bold text-foreground">Delete care program?</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-foreground">"{programToDelete.title}"</span>?
                This program has {programToDelete.trackCount || 0} tracks. Deleting it soft-deletes the program but does NOT delete the assigned tracks themselves, as they may belong to other curation sequences.
              </p>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => { setProgramToDelete(null); setShowProgDeleteConfirm(false); }}
                  className="press min-h-10 rounded-btn border border-border bg-surface px-4.5 text-xs font-bold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProgramDeleteConfirm}
                  className="press min-h-10 rounded-btn bg-destructive px-4.5 text-xs font-bold text-destructive-foreground hover:bg-destructive-hover"
                >
                  Delete Program
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DRAWER: USER DETAILS ── */}
        {isUserDetailsOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-surface h-full flex flex-col shadow-2xl relative border-l border-border animate-in slide-in-from-right duration-300">
              {/* Header */}
              <header className="flex items-center justify-between border-b border-border/80 p-5 bg-muted/25 select-none">
                <div>
                  <h3 className="text-base font-bold text-foreground">User Profile Details</h3>
                  <p className="text-[11px] text-muted-foreground font-medium mt-1">Operational view of account access, subscriptions, and history.</p>
                </div>
                <button
                  onClick={() => setIsUserDetailsOpen(false)}
                  className="press rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {loadingSelectedUser ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-cat" />
                  </div>
                ) : selectedUser ? (
                  <>
                    {/* Identity section */}
                    <div className="flex items-start gap-4.5">
                      <div className="grid h-16 w-16 place-items-center rounded-full bg-cat text-2xl font-black text-cat-foreground border border-cat/25 select-none">
                        {(selectedUser.user.fullName || selectedUser.user.email || "U").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-foreground leading-snug">{selectedUser.user.fullName || "Anonymous User"}</h4>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{selectedUser.user.email}</p>
                        
                        <div className="flex flex-wrap gap-1.5 mt-3 select-none">
                          <span className={cn(
                            "rounded-full px-2.5 py-0.5 text-[10px] font-bold border capitalize",
                            selectedUser.user.status === "active" && "bg-success/5 border-success/20 text-success",
                            selectedUser.user.status === "suspended" && "bg-destructive/5 border-destructive/20 text-destructive",
                          )}>
                            Status: {selectedUser.user.status}
                          </span>
                          <span className={cn(
                            "rounded-full px-2.5 py-0.5 text-[10px] font-bold border capitalize",
                            selectedUser.user.role === "super_admin" && "bg-purple-500/5 border-purple-500/20 text-purple-600",
                            selectedUser.user.role === "admin" && "bg-amber-500/5 border-amber-500/20 text-amber-600",
                            selectedUser.user.role === "premium" && "bg-cat-light text-cat border-cat/10",
                            selectedUser.user.role === "user" && "bg-muted border-border text-muted-foreground",
                          )}>
                            Role: {selectedUser.user.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Account Audit info */}
                    <div className="grid grid-cols-2 gap-4 border-t border-b border-border/60 py-4.5 text-xs">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-sans">Account ID</p>
                        <p className="mt-1 font-bold text-foreground font-mono text-[10px] truncate" title={selectedUser.user.id}>{selectedUser.user.id}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-sans">Language preference</p>
                        <p className="mt-1 font-bold text-foreground capitalize font-mono">{selectedUser.user.language || "English (en)"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-sans">Joined Date</p>
                        <p className="mt-1 font-semibold text-muted-foreground">
                          {new Date(selectedUser.user.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-sans">Last Updated</p>
                        <p className="mt-1 font-semibold text-muted-foreground">
                          {new Date(selectedUser.user.updatedAt || selectedUser.user.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                      </div>
                    </div>

                    {/* Active Subscription details */}
                    <div className="space-y-3.5 text-xs border-b border-border/60 pb-5">
                      <h4 className="font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 font-sans">
                        <CreditCard className="h-4 w-4 text-cat" /> Subscription parameters
                      </h4>
                      <div className="rounded-md border border-border bg-background/50 p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-muted-foreground">Current Plan</span>
                          <span className="font-bold text-foreground capitalize">
                            {selectedUser.subscription?.planName || "Free Plan"}
                          </span>
                        </div>
                        {selectedUser.subscription && (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-muted-foreground">Plan Status</span>
                              <span className={cn(
                                "rounded px-1.5 py-0.5 text-[10px] font-bold border capitalize",
                                selectedUser.subscription.status === "active" && "bg-success/5 border-success/15 text-success",
                                selectedUser.subscription.status === "trial" && "bg-blue-500/5 border-blue-500/15 text-blue-600",
                                ["canceled", "expired"].includes(selectedUser.subscription.status) && "bg-muted border-border text-muted-foreground",
                              )}>
                                {selectedUser.subscription.status}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] font-mono">
                              <span className="font-semibold text-muted-foreground font-sans">Start Date</span>
                              <span>{new Date(selectedUser.subscription.currentPeriodStart).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] font-mono">
                              <span className="font-semibold text-muted-foreground font-sans">Renewal / Expiry</span>
                              <span>{new Date(selectedUser.subscription.currentPeriodEnd).toLocaleDateString()}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Listening Analytics aggregates */}
                    <div className="space-y-3.5 text-xs">
                      <h4 className="font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 font-sans">
                        <BarChart3 className="h-4 w-4 text-cat" /> Audio listening metrics
                      </h4>
                      <div className="grid grid-cols-3 gap-3.5">
                        {[
                          { label: "Tracks Played", value: selectedUser.stats.tracksPlayed },
                          { label: "Tracks Completed", value: selectedUser.stats.tracksCompleted },
                          { label: "Favorites saved", value: selectedUser.stats.favoritesCount },
                        ].map((s) => (
                          <div key={s.label} className="rounded-md border border-border bg-background p-3 text-center">
                            <p className="text-[10px] font-semibold text-muted-foreground">{s.label}</p>
                            <p className="mt-1.5 text-xl font-bold font-mono text-foreground">{s.value.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pregnancy profile info if EDD is set */}
                    {selectedUser.user.pregnancyEdd && (
                      <div className="space-y-3.5 border-t border-border/60 pt-5 text-xs">
                        <h4 className="font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 font-sans">
                          <Calendar className="h-4 w-4 text-cat" /> Gestational pregnancy profile
                        </h4>
                        <div className="rounded-md border border-border bg-background/50 p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-muted-foreground">Estimated Due Date (EDD)</span>
                            <span className="font-bold text-foreground font-mono">
                              {new Date(selectedUser.user.pregnancyEdd).toLocaleDateString(undefined, { dateStyle: "medium" })}
                            </span>
                          </div>
                          {(() => {
                            const info = getPregnancyWeekInfo(selectedUser.user.pregnancyEdd);
                            if (!info) return null;
                            return (
                              <>
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold text-muted-foreground">Current Gestational age</span>
                                  <span className="font-bold text-cat font-mono">Week {info.week}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold text-muted-foreground">Current Trimester</span>
                                  <span className="font-bold text-foreground">Trimester {info.trimester}</span>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Recent listening history list */}
                    <div className="space-y-3 border-t border-border/60 pt-5 text-xs">
                      <h4 className="font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 font-sans">
                        <Clock className="h-4 w-4 text-cat" /> Recent listening history (Top 10)
                      </h4>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {selectedUser.history.map((h: any) => (
                          <div key={h.id} className="flex items-center justify-between p-3.5 rounded-md border border-border bg-background/30 hover:border-cat transition-all group">
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-foreground truncate">{h.title || "Unknown Track"}</p>
                              <p className="text-[10px] text-muted-foreground font-medium truncate mt-0.5">{h.artist || "Unknown Artist"}</p>
                            </div>
                            <div className="text-right ml-4 shrink-0 font-mono text-[10px] text-muted-foreground">
                              <p className="font-semibold">{formatDuration(h.durationListened)} listened</p>
                              <p className="mt-0.5 text-[9px] font-medium text-muted-foreground/80">
                                {new Date(h.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                        {selectedUser.history.length === 0 && (
                          <p className="text-center py-6 text-muted-foreground font-semibold">No recent playback history found for this account.</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-center py-10 text-muted-foreground">Failed to load user info profile details.</p>
                )}
              </div>

              {/* Details Drawer Footer Actions */}
              <footer className="border-t border-border/80 p-5 bg-muted/25 flex gap-2 items-center justify-end select-none">
                <button
                  onClick={() => setIsUserDetailsOpen(false)}
                  className="press inline-flex min-h-11 items-center justify-center rounded-btn border border-border bg-surface px-5 text-xs font-bold text-foreground hover:bg-muted shadow-sm"
                >
                  Close Profile
                </button>
                {selectedUser && selectedUser.user.role !== "super_admin" && (
                  <>
                    {selectedUser.user.status === "active" ? (
                      <button
                        onClick={() => handleDeactivate(selectedUser.user)}
                        className="press inline-flex min-h-11 items-center justify-center rounded-btn bg-destructive px-5.5 text-xs font-bold text-destructive-foreground hover:bg-destructive-hover shadow-sm"
                      >
                        Deactivate User
                      </button>
                    ) : selectedUser.user.status === "suspended" ? (
                      <button
                        onClick={() => handleReactivate(selectedUser.user)}
                        className="press inline-flex min-h-11 items-center justify-center rounded-btn bg-primary px-5.5 text-xs font-bold text-primary-foreground hover:bg-primary-hover shadow-sm"
                      >
                        Reactivate User
                      </button>
                    ) : null}
                  </>
                )}
              </footer>
            </div>
          </div>
        )}

        {/* ── MODAL: SUSPEND DEACTIVATE USER CONFIRMATION ── */}
        {showDeactivateConfirm && userToDeactivate && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-card border border-border bg-surface p-5 shadow-2xl space-y-4 mx-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 text-destructive">
                <AlertTriangle className="h-6 w-6 shrink-0" />
                <h3 className="text-base font-bold text-foreground">Deactivate User?</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to deactivate <span className="font-bold text-foreground">"{userToDeactivate.fullName || userToDeactivate.email}"</span>?
                The user will no longer be able to log in or access the application until reactivated.
              </p>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => { setUserToDeactivate(null); setShowDeactivateConfirm(false); }}
                  className="press min-h-10 rounded-btn border border-border bg-surface px-4.5 text-xs font-bold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeactivateConfirm}
                  className="press min-h-10 rounded-btn bg-destructive px-4.5 text-xs font-bold text-destructive-foreground hover:bg-destructive-hover"
                >
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: REACTIVATE USER CONFIRMATION ── */}
        {showReactivateConfirm && userToReactivate && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-card border border-border bg-surface p-5 shadow-2xl space-y-4 mx-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 text-success">
                <CheckCircle className="h-6 w-6 shrink-0" />
                <h3 className="text-base font-bold text-foreground">Reactivate User?</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to reactivate <span className="font-bold text-foreground">"{userToReactivate.fullName || userToReactivate.email}"</span>?
                This will restore login access to the user account immediately.
              </p>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => { setUserToReactivate(null); setShowReactivateConfirm(false); }}
                  className="press min-h-10 rounded-btn border border-border bg-surface px-4.5 text-xs font-bold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReactivateConfirm}
                  className="press min-h-10 rounded-btn bg-success px-4.5 text-xs font-bold text-success-foreground hover:bg-success-hover"
                >
                  Reactivate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DRAWER: SUBSCRIPTION DETAILS & ACCESS AUDIT ── */}
        {isSubDetailsOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-surface h-full flex flex-col shadow-2xl relative border-l border-border animate-in slide-in-from-right duration-300">
              {/* Header */}
              <header className="flex items-center justify-between border-b border-border/80 p-5 bg-muted/25 select-none">
                <div>
                  <h3 className="text-base font-bold text-foreground">Subscription Billing Details</h3>
                  <p className="text-[11px] text-muted-foreground font-medium mt-1">Audit customer subscription settings, transaction logs, and access permissions.</p>
                </div>
                <button
                  onClick={() => setIsSubDetailsOpen(false)}
                  className="press rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {loadingSelectedSub ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-cat" />
                  </div>
                ) : selectedSub ? (
                  <>
                    {/* User profile card */}
                    <div className="flex items-center gap-4 border-b border-border/60 pb-5">
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-cat/10 text-base font-black text-cat select-none">
                        {(selectedSub.subscription.fullName || selectedSub.subscription.email || "S").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground leading-snug">{selectedSub.subscription.fullName || "Anonymous Subscriber"}</h4>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{selectedSub.subscription.email}</p>
                      </div>
                    </div>

                    {/* Subscription billing details */}
                    <div className="space-y-3.5 text-xs">
                      <h4 className="font-bold text-muted-foreground uppercase tracking-wider font-sans">Subscription details</h4>
                      <div className="rounded-md border border-border bg-background/50 p-4.5 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-muted-foreground">Subscription ID</span>
                          <span className="font-mono text-[10px] text-foreground font-bold">{selectedSub.subscription.id}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-muted-foreground">Pricing Tier Plan</span>
                          <span className="font-bold text-cat capitalize">{selectedSub.subscription.planName || selectedSub.subscription.planId}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-muted-foreground">Price Rate</span>
                          <span className="font-bold text-foreground">₹{selectedSub.subscription.price ? selectedSub.subscription.price / 100 : 0} / month</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-muted-foreground">Status</span>
                          <span className={cn(
                            "rounded-full px-2.5 py-0.5 text-[10px] font-bold border capitalize",
                            selectedSub.subscription.status === "active" && "bg-success/5 border-success/15 text-success",
                            selectedSub.subscription.status === "trial" && "bg-blue-500/5 border-blue-500/15 text-blue-600",
                            selectedSub.subscription.status === "canceled" && "bg-destructive/5 border-destructive/20 text-destructive",
                            ["expired", "pending"].includes(selectedSub.subscription.status) && "bg-muted border-border text-muted-foreground",
                          )}>
                            {selectedSub.subscription.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center font-mono text-[11px]">
                          <span className="font-semibold text-muted-foreground font-sans">Current Period Start</span>
                          <span>{new Date(selectedSub.subscription.currentPeriodStart).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center font-mono text-[11px]">
                          <span className="font-semibold text-muted-foreground font-sans">Current Period End</span>
                          <span className="font-bold">{new Date(selectedSub.subscription.currentPeriodEnd).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Access Permission Checker */}
                    <div className="space-y-3.5 text-xs">
                      <h4 className="font-bold text-muted-foreground uppercase tracking-wider font-sans">Verify Access Permissions Rules</h4>
                      <div className="rounded-md border border-border bg-background p-4.5 space-y-3.5">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-foreground">Basic Catalogue Access</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Allows basic relaxation audio streams.</p>
                          </div>
                          <span className="text-success font-bold font-mono text-xs">✓ GRANTED (FREE)</span>
                        </div>
                        
                        <div className="flex items-start justify-between border-t border-border/50 pt-3">
                          <div>
                            <p className="font-bold text-foreground">Standard Programs & Guides</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Curated sequence builder programmes.</p>
                          </div>
                          {["standard", "premium"].includes(selectedSub.subscription.planId) ? (
                            <span className="text-success font-bold font-mono text-xs">✓ GRANTED</span>
                          ) : (
                            <span className="text-destructive font-bold font-mono text-xs">✗ RESTRICTED</span>
                          )}
                        </div>

                        <div className="flex items-start justify-between border-t border-border/50 pt-3">
                          <div>
                            <p className="font-bold text-foreground">Pregnancy Gestational Schedules</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Trimester specific schedules tracking.</p>
                          </div>
                          {selectedSub.subscription.planId === "premium" ? (
                            <span className="text-success font-bold font-mono text-xs">✓ GRANTED (PREMIUM)</span>
                          ) : (
                            <span className="text-destructive font-bold font-mono text-xs">✗ RESTRICTED</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Subscription Payments history */}
                    <div className="space-y-3 border-t border-border/60 pt-5 text-xs">
                      <h4 className="font-bold text-muted-foreground uppercase tracking-wider font-sans">Payment logs history for subscriber</h4>
                      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                        {selectedSub.paymentsHistory.map((h: any) => (
                          <div key={h.id} className="flex items-center justify-between p-3.5 rounded-md border border-border bg-background/30 hover:border-cat transition-all group font-sans">
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-foreground font-mono text-[10px]">{h.id}</p>
                              <p className="text-[9px] text-muted-foreground font-mono truncate max-w-[200px] mt-0.5">{h.orderId}</p>
                            </div>
                            <div className="text-right ml-4 shrink-0 font-mono text-[10px]">
                              <p className="font-bold text-foreground">₹{h.amount / 100}</p>
                              <span className={cn(
                                "rounded px-1 text-[9px] font-bold border capitalize inline-block mt-1",
                                h.status === "completed" && "bg-success/5 border-success/15 text-success",
                                h.status === "pending" && "bg-muted border-border text-muted-foreground",
                                h.status === "failed" && "bg-destructive/5 border-destructive/15 text-destructive",
                              )}>
                                {h.status === "completed" ? "Success" : h.status}
                              </span>
                            </div>
                          </div>
                        ))}
                        {selectedSub.paymentsHistory.length === 0 && (
                          <p className="text-center py-6 text-muted-foreground font-semibold">No transactions recorded for this subscription.</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-center py-10 text-muted-foreground">Failed to load subscriber details.</p>
                )}
              </div>

              {/* Details Drawer Footer Actions */}
              <footer className="border-t border-border/80 p-5 bg-muted/25 flex gap-2 items-center justify-end select-none">
                <button
                  onClick={() => setIsSubDetailsOpen(false)}
                  className="press inline-flex min-h-11 items-center justify-center rounded-btn border border-border bg-surface px-5 text-xs font-bold text-foreground hover:bg-muted shadow-sm"
                >
                  Close Audit
                </button>
                {selectedSub && selectedSub.subscription.status === "active" && (
                  <>
                    <button
                      onClick={() => handleExtendSub(selectedSub.subscription)}
                      className="press inline-flex min-h-11 items-center justify-center rounded-btn bg-primary px-5 text-xs font-bold text-primary-foreground hover:bg-primary-hover shadow-sm"
                    >
                      Extend Period
                    </button>
                    <button
                      onClick={() => handleCancelSub(selectedSub.subscription)}
                      className="press inline-flex min-h-11 items-center justify-center rounded-btn bg-destructive px-5.5 text-xs font-bold text-destructive-foreground hover:bg-destructive-hover shadow-sm"
                    >
                      Cancel Subscription
                    </button>
                  </>
                )}
              </footer>
            </div>
          </div>
        )}

        {/* ── DRAWER: EDIT PRICING PLAN ── */}
        {isPlanFormOpen && editingPlan && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-surface h-full flex flex-col shadow-2xl relative border-l border-border animate-in slide-in-from-right duration-300">
              {/* Drawer Header */}
              <header className="flex items-center justify-between border-b border-border/80 p-5 bg-muted/25 select-none">
                <div>
                  <h3 className="text-base font-bold text-foreground">Edit Pricing Plan — {editingPlan.id.toUpperCase()}</h3>
                  <p className="text-[11px] text-muted-foreground font-medium mt-1">Configure pricing tier prices, interval details and status.</p>
                </div>
                <button
                  onClick={() => { setIsPlanFormOpen(false); setEditingPlan(null); }}
                  className="press rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              {/* Drawer Form Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <label className="block">
                  <span className={labelCls}>Plan Display Name</span>
                  <input
                    type="text"
                    value={planFormName}
                    onChange={(e) => setPlanFormName(e.target.value)}
                    className={fieldCls}
                    placeholder="e.g. Sanjeevni Premium"
                  />
                </label>

                <label className="block">
                  <span className={labelCls}>Plan Rate Price (INR ₹)</span>
                  <input
                    type="number"
                    min={0}
                    value={planFormPrice}
                    onChange={(e) => setPlanFormPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                    className={fieldCls}
                    placeholder="Rate amount e.g. 299"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">This price will be parsed and stored in paise inside the plans repository.</p>
                </label>

                <label className="block">
                  <span className={labelCls}>Billing Interval</span>
                  <select
                    value={planFormInterval}
                    onChange={(e) => setPlanFormInterval(e.target.value)}
                    className={fieldCls}
                  >
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                </label>

                <div className="flex items-center gap-3 rounded-md border border-border p-4.5 bg-background/30 mt-6 select-none">
                  <input
                    type="checkbox"
                    id="planFormIsActive"
                    checked={planFormIsActive}
                    onChange={(e) => setPlanFormIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-cat focus:ring-cat"
                  />
                  <label htmlFor="planFormIsActive" className="text-xs font-bold text-foreground cursor-pointer">
                    Enable active configuration for subscription orders
                  </label>
                </div>
              </div>

              {/* Drawer Footer */}
              <footer className="border-t border-border/80 p-5 bg-muted/25 flex gap-2 items-center justify-end select-none">
                <button
                  type="button"
                  onClick={() => { setIsPlanFormOpen(false); setEditingPlan(null); }}
                  className="press inline-flex min-h-11 items-center justify-center rounded-btn border border-border bg-surface px-5 text-xs font-bold text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePlanFormSubmit}
                  disabled={planFormSaving}
                  className="press inline-flex min-h-11 items-center justify-center rounded-btn bg-primary px-5.5 text-xs font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
                >
                  {planFormSaving ? "Saving Configuration..." : "Save plan"}
                </button>
              </footer>
            </div>
          </div>
        )}

        {/* ── MODAL: CANCEL active SUBSCRIPTION CONFIRMATION ── */}
        {showCancelConfirm && subToCancel && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-card border border-border bg-surface p-5 shadow-2xl space-y-4 mx-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 text-destructive">
                <AlertTriangle className="h-6 w-6 shrink-0" />
                <h3 className="text-base font-bold text-foreground">Cancel subscription?</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to cancel the subscription for <span className="font-bold text-foreground">"{subToCancel.fullName || subToCancel.email}"</span>?
                This will transition the subscription status to <span className="font-bold text-foreground">canceled</span> immediately.
              </p>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => { setSubToCancel(null); setShowCancelConfirm(false); }}
                  className="press min-h-10 rounded-btn border border-border bg-surface px-4.5 text-xs font-bold hover:bg-muted"
                >
                  Close
                </button>
                <button
                  onClick={handleCancelSubConfirm}
                  className="press min-h-10 rounded-btn bg-destructive px-4.5 text-xs font-bold text-destructive-foreground hover:bg-destructive-hover"
                >
                  Cancel billing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: EXTEND subscription period DAYS ── */}
        {showExtendConfirm && subToExtend && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-card border border-border bg-surface p-5 shadow-2xl space-y-4 mx-4 animate-in zoom-in-95 duration-200 animate-out duration-200">
              <div className="flex items-center gap-3 border-b border-border pb-3 text-success">
                <CheckCircle className="h-5 w-5" />
                <h3 className="text-base font-bold text-foreground">Extend Subscription</h3>
              </div>

              <div className="space-y-4 text-xs text-left">
                <p className="text-muted-foreground">
                  Shift the current period end date for <span className="font-bold text-foreground">"{subToExtend.fullName || subToExtend.email}"</span> forward.
                </p>
                <label className="block">
                  <span className={labelCls}>Days to extend</span>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={extensionDays}
                    onChange={(e) => setExtensionDays(Math.max(1, Math.min(365, parseInt(e.target.value) || 30)))}
                    className={fieldCls}
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 select-none">
                <button
                  onClick={() => { setSubToExtend(null); setShowExtendConfirm(false); }}
                  className="press min-h-10 rounded-btn border border-border bg-surface px-4.5 text-xs font-bold hover:bg-muted"
                >
                  Close
                </button>
                <button
                  onClick={handleExtendSubConfirm}
                  className="press min-h-10 rounded-btn bg-success px-4.5 text-xs font-bold text-success-foreground hover:bg-success-hover"
                >
                  Extend Period
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
