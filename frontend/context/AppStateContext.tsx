"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getDefaultFeeds, optimizeRation, screenCattleHealth } from "@/lib/api";
import {
  createDefaultHealthStatus,
  DEFAULT_BARNS,
  DEFAULT_BREEDS,
  DEFAULT_CATTLE_LIST,
  DEFAULT_CATTLE_PROFILE,
  DEFAULT_DEMO_ACCOUNTS,
  DEFAULT_FARM_SETTINGS,
  DEFAULT_LOCAL_FEEDS,
  DEFAULT_VET_CONTACTS,
} from "@/lib/constants";
import {
  calculateDaysToQurban,
  optimizeRationFallback,
} from "@/lib/fallback-engines";
import type {
  AiRationRecommendation,
  AuthUser,
  BarnItem,
  BreedItem,
  CattleProfile,
  FarmSettings,
  FeedItem,
  HealthChecklistForm,
  HealthStatus,
  OptimizationResult,
  StoredUserAccount,
  WeightLogEntry,
} from "@/types";

const STORAGE_KEYS = {
  authSession: "ppq_auth_session_v3",
  userAccounts: "ppq_user_accounts_v3",
  barns: "ppq_master_barns_v3",
  breeds: "ppq_master_breeds_v3",
  farmSettings: "ppq_farm_settings_v3",
  cattleList: "ppq_cattle_list_v3",
  activeCattleId: "ppq_active_cattle_id_v3",
  feeds: "ppq_local_feeds_v4",
  healthMap: "ppq_health_map_v3",
  healthHistoryMap: "ppq_health_history_map_v3",
  aiRecommendations: "ppq_ai_recommendations_v1",
} as const;

export interface CattleFormInput {
  name?: string; // Jika kosong, otomatis generate "Sapi X"
  barnId: string;
  stallNumber?: string;
  breed: string;
  earTag?: string;
  initialWeightKg: number;
  currentWeightKg: number;
  targetWeightKg: number;
  startDate: string;
  targetDateQurban: string;
}

export interface RegisterInput {
  name: string;
  identifier: string;
  password: string;
  farmName: string;
}

interface AppStateContextValue {
  isHydrated: boolean;
  apiMode: "backend" | "fallback";
  // Authentication (1 Role: Peternak)
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (
    identifier: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>;
  registerUser: (
    input: RegisterInput
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;

  // Data Master: Kandang, Bangsa Sapi, Pakan, & Pengaturan
  barns: BarnItem[];
  addBarn: (input: Omit<BarnItem, "id">) => BarnItem;
  updateBarn: (id: string, patch: Partial<BarnItem>) => void;
  deleteBarn: (id: string) => { ok: boolean; error?: string };

  breeds: BreedItem[];
  addBreed: (input: Omit<BreedItem, "id">) => BreedItem;
  updateBreed: (id: string, patch: Partial<BreedItem>) => void;
  deleteBreed: (id: string) => void;

  farmSettings: FarmSettings;
  updateFarmSettings: (patch: Partial<FarmSettings>) => void;

  feeds: FeedItem[];
  updateFeedItem: (id: string, patch: Partial<FeedItem>) => void;
  addCustomFeed: (feed: Omit<FeedItem, "id">) => void;
  deleteFeedItem: (id: string) => void;
  resetDefaultFeeds: () => Promise<void>;

  // Multi-cattle state & CRUD
  cattleList: CattleProfile[];
  activeCattleId: string;
  getNextDefaultCattleName: () => string;
  healthByCattleId: Record<string, HealthStatus>;
  optimizationByCattleId: Record<string, OptimizationResult>;
  selectActiveCattle: (id: string) => Promise<void>;
  createCattle: (input: CattleFormInput) => Promise<CattleProfile>;
  updateCattleById: (
    id: string,
    patch: Partial<CattleProfile>
  ) => Promise<void>;
  deleteCattleById: (id: string) => void;

  // Active cattle convenience getters & actions
  profile: CattleProfile;
  optimizationResult: OptimizationResult;
  healthStatus: HealthStatus;
  healthHistory: HealthStatus[];
  daysToQurban: number;
  isOptimizing: boolean;
  isScreening: boolean;
  updateProfile: (next: Partial<CattleProfile>) => Promise<void>;
  addWeightLog: (
    entry: Omit<WeightLogEntry, "id">,
    cattleId?: string
  ) => Promise<void>;
  removeWeightLog: (logId: string, cattleId?: string) => Promise<void>;
  runOptimization: (
    overrideFeeds?: FeedItem[],
    cattleId?: string
  ) => Promise<OptimizationResult>;
  runHealthScreening: (input: HealthChecklistForm) => Promise<HealthStatus>;
  resetAllDemoData: () => Promise<void>;

  // AI Ration Recommendation Persistence
  aiRecommendationsByCattleId: Record<string, AiRationRecommendation>;
  saveAiRecommendation: (
    cattleId: string,
    recommendation: AiRationRecommendation
  ) => void;
  clearAiRecommendation: (cattleId: string) => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

function buildInitialHealthMap(
  list: CattleProfile[]
): Record<string, HealthStatus> {
  const map: Record<string, HealthStatus> = {};
  list.forEach((c) => {
    map[c.id] = createDefaultHealthStatus(c.id);
  });
  return map;
}

function buildInitialHistoryMap(
  list: CattleProfile[]
): Record<string, HealthStatus[]> {
  const map: Record<string, HealthStatus[]> = {};
  list.forEach((c) => {
    map[c.id] = [createDefaultHealthStatus(c.id)];
  });
  return map;
}

function getBreedMaxAdg(breeds: BreedItem[], breedName: string): number {
  const found = breeds.find(
    (b) => b.name.toLowerCase() === breedName.toLowerCase()
  );
  return found?.maxBiologicalAdgKg ?? 1.5;
}

function buildFallbackOptimizationMap(
  list: CattleProfile[],
  feeds: FeedItem[],
  breeds: BreedItem[]
): Record<string, OptimizationResult> {
  const map: Record<string, OptimizationResult> = {};
  list.forEach((c) => {
    map[c.id] = optimizeRationFallback({
      cattleId: c.id,
      currentWeightKg: c.currentWeightKg,
      targetWeightKg: c.targetWeightKg,
      daysToQurban: calculateDaysToQurban(c.targetDateQurban),
      availableFeeds: feeds,
      maxBiologicalAdgKg: getBreedMaxAdg(breeds, c.breed),
      breedName: c.breed,
    });
  });
  return map;
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [apiMode, setApiMode] = useState<"backend" | "fallback">("fallback");

  // Auth
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [accounts, setAccounts] = useState<StoredUserAccount[]>(
    DEFAULT_DEMO_ACCOUNTS
  );

  // Master Data
  const [barns, setBarns] = useState<BarnItem[]>(DEFAULT_BARNS);
  const [breeds, setBreeds] = useState<BreedItem[]>(DEFAULT_BREEDS);
  const [farmSettings, setFarmSettings] =
    useState<FarmSettings>(DEFAULT_FARM_SETTINGS);
  const [feeds, setFeeds] = useState<FeedItem[]>(DEFAULT_LOCAL_FEEDS);

  // Cattle & Operational Data
  const [cattleList, setCattleList] =
    useState<CattleProfile[]>(DEFAULT_CATTLE_LIST);
  const [activeCattleId, setActiveCattleId] = useState<string>(
    DEFAULT_CATTLE_LIST[0].id
  );

  const [healthByCattleId, setHealthByCattleId] = useState<
    Record<string, HealthStatus>
  >(() => buildInitialHealthMap(DEFAULT_CATTLE_LIST));

  const [healthHistoryByCattleId, setHealthHistoryByCattleId] = useState<
    Record<string, HealthStatus[]>
  >(() => buildInitialHistoryMap(DEFAULT_CATTLE_LIST));

  const [optimizationByCattleId, setOptimizationByCattleId] = useState<
    Record<string, OptimizationResult>
  >(() =>
    buildFallbackOptimizationMap(
      DEFAULT_CATTLE_LIST,
      DEFAULT_LOCAL_FEEDS,
      DEFAULT_BREEDS
    )
  );

  const [aiRecommendationsByCattleId, setAiRecommendationsByCattleId] =
    useState<Record<string, AiRationRecommendation>>({});

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isScreening, setIsScreening] = useState(false);

  const profile = useMemo<CattleProfile>(() => {
    const found = cattleList.find((c) => c.id === activeCattleId);
    return found || cattleList[0] || DEFAULT_CATTLE_PROFILE;
  }, [cattleList, activeCattleId]);

  const daysToQurban = useMemo(
    () => calculateDaysToQurban(profile.targetDateQurban),
    [profile.targetDateQurban]
  );

  const optimizationResult = useMemo<OptimizationResult>(() => {
    return (
      optimizationByCattleId[profile.id] ||
      optimizeRationFallback({
        cattleId: profile.id,
        currentWeightKg: profile.currentWeightKg,
        targetWeightKg: profile.targetWeightKg,
        daysToQurban,
        availableFeeds: feeds,
        maxBiologicalAdgKg: getBreedMaxAdg(breeds, profile.breed),
        breedName: profile.breed,
      })
    );
  }, [optimizationByCattleId, profile, daysToQurban, feeds, breeds]);

  const healthStatus = useMemo<HealthStatus>(() => {
    return (
      healthByCattleId[profile.id] || createDefaultHealthStatus(profile.id)
    );
  }, [healthByCattleId, profile.id]);

  const healthHistory = useMemo<HealthStatus[]>(() => {
    return healthHistoryByCattleId[profile.id] || [healthStatus];
  }, [healthHistoryByCattleId, profile.id, healthStatus]);

  // Helper penamaan otomatis "Sapi 1", "Sapi 2", dst.
  const getNextDefaultCattleName = useCallback((): string => {
    let maxNum = cattleList.length;
    cattleList.forEach((c) => {
      const match = c.name.match(/^sapi\s*(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    return `Sapi ${maxNum + 1}`;
  }, [cattleList]);

  // Hydrate dari localStorage
  useEffect(() => {
    let mounted = true;

    async function init() {
      let loadedSession: AuthUser | null = null;
      let loadedAccounts = DEFAULT_DEMO_ACCOUNTS;
      let loadedBarns = DEFAULT_BARNS;
      let loadedBreeds = DEFAULT_BREEDS;
      let loadedSettings = DEFAULT_FARM_SETTINGS;
      let loadedList = DEFAULT_CATTLE_LIST;
      let loadedActiveId = DEFAULT_CATTLE_LIST[0].id;
      let loadedFeeds = DEFAULT_LOCAL_FEEDS;
      let loadedHealthMap = buildInitialHealthMap(DEFAULT_CATTLE_LIST);
      let loadedHistoryMap = buildInitialHistoryMap(DEFAULT_CATTLE_LIST);
      let loadedAiRecs: Record<string, AiRationRecommendation> = {};
      let hasSavedFeeds = false;

      try {
        const rawSession = localStorage.getItem(STORAGE_KEYS.authSession);
        if (rawSession) loadedSession = JSON.parse(rawSession);

        const rawAcc = localStorage.getItem(STORAGE_KEYS.userAccounts);
        if (rawAcc) {
          const p = JSON.parse(rawAcc);
          if (Array.isArray(p) && p.length > 0) loadedAccounts = p;
        }

        const rawBarns = localStorage.getItem(STORAGE_KEYS.barns);
        if (rawBarns) {
          const p = JSON.parse(rawBarns);
          if (Array.isArray(p) && p.length > 0) loadedBarns = p;
        }

        const rawBreeds = localStorage.getItem(STORAGE_KEYS.breeds);
        if (rawBreeds) {
          const p = JSON.parse(rawBreeds);
          if (Array.isArray(p) && p.length > 0) loadedBreeds = p;
        }

        const rawSettings = localStorage.getItem(STORAGE_KEYS.farmSettings);
        if (rawSettings) {
          const parsedSettings = JSON.parse(rawSettings);
          loadedSettings = {
            ...DEFAULT_FARM_SETTINGS,
            ...parsedSettings,
            vetContacts:
              parsedSettings.vetContacts && parsedSettings.vetContacts.length > 0
                ? parsedSettings.vetContacts
                : DEFAULT_VET_CONTACTS,
          };
        }

        const rawList = localStorage.getItem(STORAGE_KEYS.cattleList);
        if (rawList) {
          const p = JSON.parse(rawList);
          if (Array.isArray(p)) {
            const defaultBarnA = loadedBarns[0]?.id || "kandang-a";
            const defaultBarnB = loadedBarns[1]?.id || defaultBarnA;
            loadedList = p.map((c: CattleProfile, index: number) => {
              const hasValidBarn = loadedBarns.some((b) => b.id === c.barnId);
              if (!hasValidBarn) {
                return {
                  ...c,
                  barnId: index < 2 ? defaultBarnA : defaultBarnB,
                  stallNumber: c.stallNumber || `Patok 0${index + 1}`,
                };
              }
              return c;
            });
          }
        }

        const rawActiveId = localStorage.getItem(STORAGE_KEYS.activeCattleId);
        if (rawActiveId) loadedActiveId = rawActiveId;

        const rawFeeds = localStorage.getItem(STORAGE_KEYS.feeds);
        if (rawFeeds) {
          const parsedFeeds = JSON.parse(rawFeeds);
          if (
            Array.isArray(parsedFeeds) &&
            parsedFeeds.some((f) =>
              f.name.toLowerCase().includes("dami") ||
              f.name.toLowerCase().includes("nutrifeed") ||
              f.name.toLowerCase().includes("polar")
            )
          ) {
            // Selaraskan harga bawaan terbaru hasil wawancara peternak lapangan
            const defMap = new Map(
              DEFAULT_LOCAL_FEEDS.map((df) => [df.id, df])
            );
            loadedFeeds = parsedFeeds.map((f: FeedItem) => {
              const def = defMap.get(f.id);
              if (def) {
                return {
                  ...f,
                  pricePerKg: def.pricePerKg,
                  maxLimitKg: Math.max(f.maxLimitKg, def.maxLimitKg),
                };
              }
              return f;
            });
            hasSavedFeeds = true;
          }
        }

        const rawHealthMap = localStorage.getItem(STORAGE_KEYS.healthMap);
        if (rawHealthMap) loadedHealthMap = JSON.parse(rawHealthMap);

        const rawHistoryMap = localStorage.getItem(
          STORAGE_KEYS.healthHistoryMap
        );
        if (rawHistoryMap) loadedHistoryMap = JSON.parse(rawHistoryMap);

        const rawAiRecs = localStorage.getItem(STORAGE_KEYS.aiRecommendations);
        if (rawAiRecs) {
          try {
            const parsed = JSON.parse(rawAiRecs);
            if (parsed && typeof parsed === "object") loadedAiRecs = parsed;
          } catch {
            // Ignore
          }
        }
      } catch {
        // Ignore storage errors
      }

      if (
        loadedList.length > 0 &&
        !loadedList.some((c) => c.id === loadedActiveId)
      ) {
        loadedActiveId = loadedList[0].id;
      }

      if (!hasSavedFeeds) {
        const remoteFeeds = await getDefaultFeeds();
        loadedFeeds = remoteFeeds.feeds;
        if (mounted) setApiMode(remoteFeeds.source);
      }

      const initialOptMap = buildFallbackOptimizationMap(
        loadedList,
        loadedFeeds,
        loadedBreeds
      );

      const activeCattle =
        loadedList.find((c) => c.id === loadedActiveId) || loadedList[0];
      if (activeCattle) {
        const optRes = await optimizeRation({
          cattleId: activeCattle.id,
          currentWeightKg: activeCattle.currentWeightKg,
          targetWeightKg: activeCattle.targetWeightKg,
          daysToQurban: calculateDaysToQurban(activeCattle.targetDateQurban),
          availableFeeds: loadedFeeds,
          maxBiologicalAdgKg: getBreedMaxAdg(loadedBreeds, activeCattle.breed),
          breedName: activeCattle.breed,
        });
        initialOptMap[activeCattle.id] = optRes;
        if (mounted && optRes.source) setApiMode(optRes.source);
      }

      if (!mounted) return;
      setCurrentUser(loadedSession);
      setAccounts(loadedAccounts);
      setBarns(loadedBarns);
      setBreeds(loadedBreeds);
      setFarmSettings(loadedSettings);
      setCattleList(loadedList);
      setActiveCattleId(loadedActiveId);
      setFeeds(loadedFeeds);
      setHealthByCattleId(loadedHealthMap);
      setHealthHistoryByCattleId(loadedHistoryMap);
      setAiRecommendationsByCattleId(loadedAiRecs);
      setOptimizationByCattleId(initialOptMap);
      setIsHydrated(true);
    }

    init();
    return () => {
      mounted = false;
    };
  }, []);

  // Persist ke localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (currentUser) {
        localStorage.setItem(
          STORAGE_KEYS.authSession,
          JSON.stringify(currentUser)
        );
      } else {
        localStorage.removeItem(STORAGE_KEYS.authSession);
      }
      localStorage.setItem(
        STORAGE_KEYS.userAccounts,
        JSON.stringify(accounts)
      );
      localStorage.setItem(STORAGE_KEYS.barns, JSON.stringify(barns));
      localStorage.setItem(STORAGE_KEYS.breeds, JSON.stringify(breeds));
      localStorage.setItem(
        STORAGE_KEYS.farmSettings,
        JSON.stringify(farmSettings)
      );
      localStorage.setItem(
        STORAGE_KEYS.cattleList,
        JSON.stringify(cattleList)
      );
      localStorage.setItem(STORAGE_KEYS.activeCattleId, activeCattleId);
      localStorage.setItem(STORAGE_KEYS.feeds, JSON.stringify(feeds));
      localStorage.setItem(
        STORAGE_KEYS.healthMap,
        JSON.stringify(healthByCattleId)
      );
      localStorage.setItem(
        STORAGE_KEYS.healthHistoryMap,
        JSON.stringify(healthHistoryByCattleId)
      );
    } catch {
      // Ignore quota errors
    }
  }, [
    isHydrated,
    currentUser,
    accounts,
    barns,
    breeds,
    farmSettings,
    cattleList,
    activeCattleId,
    feeds,
    healthByCattleId,
    healthHistoryByCattleId,
  ]);

  // ================= AUTHENTICATION =================
  const login = useCallback(
    async (
      identifier: string,
      password: string
    ): Promise<{ ok: boolean; error?: string }> => {
      const normalized = identifier.trim().toLowerCase();
      const matched = accounts.find(
        (acc) =>
          acc.identifier.toLowerCase() === normalized &&
          acc.password === password
      );
      if (!matched) {
        return {
          ok: false,
          error:
            "Email / Nomor HP atau kata sandi tidak sesuai. Silakan periksa kembali.",
        };
      }
      setCurrentUser({
        id: matched.id,
        name: matched.name,
        identifier: matched.identifier,
        farmName: matched.farmName,
      });
      return { ok: true };
    },
    [accounts]
  );

  const registerUser = useCallback(
    async (
      input: RegisterInput
    ): Promise<{ ok: boolean; error?: string }> => {
      const normalized = input.identifier.trim().toLowerCase();
      if (accounts.some((acc) => acc.identifier.toLowerCase() === normalized)) {
        return {
          ok: false,
          error: "Email atau Nomor HP tersebut sudah terdaftar.",
        };
      }
      const newAcc: StoredUserAccount = {
        id: `user-${Date.now()}`,
        name: input.name.trim(),
        identifier: input.identifier.trim(),
        password: input.password,
        farmName: input.farmName.trim(),
      };
      setAccounts((prev) => [...prev, newAcc]);
      setCurrentUser({
        id: newAcc.id,
        name: newAcc.name,
        identifier: newAcc.identifier,
        farmName: newAcc.farmName,
      });
      return { ok: true };
    },
    [accounts]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.authSession);
    } catch {
      // Ignore
    }
  }, []);

  // ================= MASTER KANDANG CRUD =================
  const addBarn = useCallback((input: Omit<BarnItem, "id">): BarnItem => {
    const newBarn: BarnItem = {
      ...input,
      id: `kandang-${Date.now()}`,
    };
    setBarns((prev) => [...prev, newBarn]);
    return newBarn;
  }, []);

  const updateBarn = useCallback((id: string, patch: Partial<BarnItem>) => {
    setBarns((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
    );
  }, []);

  const deleteBarn = useCallback(
    (id: string): { ok: boolean; error?: string } => {
      const occupiedCount = cattleList.filter((c) => c.barnId === id).length;
      if (occupiedCount > 0) {
        return {
          ok: false,
          error: `Kandang tidak dapat dihapus karena masih berisi ${occupiedCount} ekor sapi. Pindahkan sapi terlebih dahulu.`,
        };
      }
      if (barns.length <= 1) {
        return {
          ok: false,
          error: "Minimal harus terdapat 1 data kandang aktif.",
        };
      }
      setBarns((prev) => prev.filter((b) => b.id !== id));
      return { ok: true };
    },
    [cattleList, barns.length]
  );

  // ================= MASTER BANGSA / RAS SAPI CRUD =================
  const addBreed = useCallback((input: Omit<BreedItem, "id">): BreedItem => {
    const newBreed: BreedItem = {
      ...input,
      id: `breed-${Date.now()}`,
    };
    setBreeds((prev) => [...prev, newBreed]);
    return newBreed;
  }, []);

  const updateBreed = useCallback(
    (id: string, patch: Partial<BreedItem>) => {
      setBreeds((prev) => {
        const nextBreeds = prev.map((b) =>
          b.id === id ? { ...b, ...patch } : b
        );
        setOptimizationByCattleId(
          buildFallbackOptimizationMap(cattleList, feeds, nextBreeds)
        );
        return nextBreeds;
      });
    },
    [cattleList, feeds]
  );

  const deleteBreed = useCallback((id: string) => {
    setBreeds((prev) => (prev.length > 1 ? prev.filter((b) => b.id !== id) : prev));
  }, []);

  // ================= MASTER PENGATURAN MUSIM KURBAN =================
  const updateFarmSettings = useCallback((patch: Partial<FarmSettings>) => {
    setFarmSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  // ================= OPTIMIZATION HELPER =================
  const runOptimizationForCattle = useCallback(
    async (
      targetCattle: CattleProfile,
      targetFeeds: FeedItem[],
      currentBreeds: BreedItem[] = breeds
    ): Promise<OptimizationResult> => {
      setIsOptimizing(true);
      try {
        const result = await optimizeRation({
          cattleId: targetCattle.id,
          currentWeightKg: targetCattle.currentWeightKg,
          targetWeightKg: targetCattle.targetWeightKg,
          daysToQurban: calculateDaysToQurban(targetCattle.targetDateQurban),
          availableFeeds: targetFeeds,
          maxBiologicalAdgKg: getBreedMaxAdg(currentBreeds, targetCattle.breed),
          breedName: targetCattle.breed,
        });
        setOptimizationByCattleId((prev) => ({
          ...prev,
          [targetCattle.id]: result,
        }));
        if (result.source) setApiMode(result.source);
        return result;
      } finally {
        setIsOptimizing(false);
      }
    },
    [breeds]
  );

  // ================= MULTI-CATTLE CRUD =================
  const selectActiveCattle = useCallback(
    async (id: string) => {
      setActiveCattleId(id);
      const found = cattleList.find((c) => c.id === id);
      if (found) {
        await runOptimizationForCattle(found, feeds);
      }
    },
    [cattleList, feeds, runOptimizationForCattle]
  );

  const createCattle = useCallback(
    async (input: CattleFormInput): Promise<CattleProfile> => {
      const id = `sapi-${Date.now()}`;
      const todayIso = new Date().toISOString().slice(0, 10);
      const finalName = input.name?.trim() || getNextDefaultCattleName();

      const logs: WeightLogEntry[] = [
        {
          id: `log-${Date.now()}-1`,
          date: input.startDate || todayIso,
          weightKg: Number(input.initialWeightKg),
          note: "Penimbangan awal masuk kandang",
        },
      ];

      if (
        Number(input.currentWeightKg) !== Number(input.initialWeightKg) &&
        input.startDate !== todayIso
      ) {
        logs.push({
          id: `log-${Date.now()}-2`,
          date: todayIso,
          weightKg: Number(input.currentWeightKg),
          note: "Bobot terkini saat registrasi",
        });
      }

      const newCattle: CattleProfile = {
        id,
        name: finalName,
        barnId: input.barnId || barns[0]?.id || "kandang-a",
        stallNumber: input.stallNumber?.trim() || "",
        breed: input.breed,
        earTag: input.earTag?.trim() || "",
        initialWeightKg: Number(input.initialWeightKg),
        currentWeightKg: Number(input.currentWeightKg),
        targetWeightKg: Number(input.targetWeightKg),
        startDate: input.startDate || todayIso,
        targetDateQurban:
          input.targetDateQurban || farmSettings.defaultTargetDateQurban,
        weightLogs: logs,
      };

      const defaultHealth = createDefaultHealthStatus(id);

      setCattleList((prev) => [newCattle, ...prev]);
      setActiveCattleId(id);
      setHealthByCattleId((prev) => ({ ...prev, [id]: defaultHealth }));
      setHealthHistoryByCattleId((prev) => ({
        ...prev,
        [id]: [defaultHealth],
      }));

      await runOptimizationForCattle(newCattle, feeds);
      return newCattle;
    },
    [
      barns,
      farmSettings.defaultTargetDateQurban,
      feeds,
      getNextDefaultCattleName,
      runOptimizationForCattle,
    ]
  );

  const updateCattleById = useCallback(
    async (id: string, patch: Partial<CattleProfile>) => {
      let updatedTarget: CattleProfile | null = null;
      setCattleList((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            updatedTarget = { ...item, ...patch };
            return updatedTarget;
          }
          return item;
        })
      );
      if (updatedTarget) {
        await runOptimizationForCattle(updatedTarget, feeds);
      }
    },
    [feeds, runOptimizationForCattle]
  );

  const deleteCattleById = useCallback(
    (id: string) => {
      setCattleList((prev) => {
        const remaining = prev.filter((item) => item.id !== id);
        if (activeCattleId === id) {
          setActiveCattleId(remaining[0]?.id || "");
        }
        return remaining;
      });
      setHealthByCattleId((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setHealthHistoryByCattleId((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setOptimizationByCattleId((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setAiRecommendationsByCattleId((prev) => {
        const next = { ...prev };
        delete next[id];
        try {
          localStorage.setItem(
            STORAGE_KEYS.aiRecommendations,
            JSON.stringify(next)
          );
        } catch {
          // Ignore
        }
        return next;
      });
    },
    [activeCattleId]
  );

  const updateProfile = useCallback(
    async (patch: Partial<CattleProfile>) => {
      await updateCattleById(profile.id, patch);
    },
    [profile.id, updateCattleById]
  );

  const addWeightLog = useCallback(
    async (entry: Omit<WeightLogEntry, "id">, targetId?: string) => {
      const id = targetId || profile.id;
      const target = cattleList.find((c) => c.id === id);
      if (!target) return;

      const newEntry: WeightLogEntry = {
        ...entry,
        id: `log-${Date.now()}`,
      };
      const mergedLogs = [...target.weightLogs, newEntry].sort((a, b) =>
        a.date.localeCompare(b.date)
      );
      const latestWeight =
        mergedLogs[mergedLogs.length - 1]?.weightKg ?? entry.weightKg;
      const earliestWeight =
        mergedLogs[0]?.weightKg ?? target.initialWeightKg;

      await updateCattleById(id, {
        initialWeightKg: earliestWeight,
        currentWeightKg: latestWeight,
        weightLogs: mergedLogs,
      });
    },
    [cattleList, profile.id, updateCattleById]
  );

  const removeWeightLog = useCallback(
    async (logId: string, targetId?: string) => {
      const id = targetId || profile.id;
      const target = cattleList.find((c) => c.id === id);
      if (!target || target.weightLogs.length <= 1) return;

      const filtered = target.weightLogs
        .filter((l) => l.id !== logId)
        .sort((a, b) => a.date.localeCompare(b.date));
      const latestWeight =
        filtered[filtered.length - 1]?.weightKg ?? target.currentWeightKg;

      await updateCattleById(id, {
        currentWeightKg: latestWeight,
        weightLogs: filtered,
      });
    },
    [cattleList, profile.id, updateCattleById]
  );

  // ================= MASTER PAKAN CRUD =================
  const updateFeedItem = useCallback(
    (id: string, patch: Partial<FeedItem>) => {
      setFeeds((prev) => {
        const nextFeeds = prev.map((item) =>
          item.id === id ? { ...item, ...patch } : item
        );
        setOptimizationByCattleId(
          buildFallbackOptimizationMap(cattleList, nextFeeds, breeds)
        );
        return nextFeeds;
      });
    },
    [cattleList, breeds]
  );

  const addCustomFeed = useCallback(
    (feed: Omit<FeedItem, "id">) => {
      const newFeed: FeedItem = {
        ...feed,
        id: `feed_custom_${Date.now()}`,
        isCustom: true,
      };
      setFeeds((prev) => {
        const nextFeeds = [...prev, newFeed];
        setOptimizationByCattleId(
          buildFallbackOptimizationMap(cattleList, nextFeeds, breeds)
        );
        return nextFeeds;
      });
    },
    [cattleList, breeds]
  );

  const deleteFeedItem = useCallback(
    (id: string) => {
      setFeeds((prev) => {
        if (prev.length <= 1) return prev;
        const nextFeeds = prev.filter((item) => item.id !== id);
        setOptimizationByCattleId(
          buildFallbackOptimizationMap(cattleList, nextFeeds, breeds)
        );
        return nextFeeds;
      });
    },
    [cattleList, breeds]
  );

  const resetDefaultFeeds = useCallback(async () => {
    const { feeds: defFeeds, source } = await getDefaultFeeds();
    setFeeds(defFeeds);
    setApiMode(source);
    setOptimizationByCattleId(
      buildFallbackOptimizationMap(cattleList, defFeeds, breeds)
    );
    await runOptimizationForCattle(profile, defFeeds);
  }, [cattleList, breeds, profile, runOptimizationForCattle]);

  const runOptimization = useCallback(
    async (
      overrideFeeds?: FeedItem[],
      cattleId?: string
    ): Promise<OptimizationResult> => {
      const targetFeeds = overrideFeeds || feeds;
      const targetCattle =
        cattleList.find((c) => c.id === (cattleId || profile.id)) || profile;
      return runOptimizationForCattle(targetCattle, targetFeeds);
    },
    [cattleList, feeds, profile, runOptimizationForCattle]
  );

  const runHealthScreening = useCallback(
    async (input: HealthChecklistForm): Promise<HealthStatus> => {
      setIsScreening(true);
      try {
        const res = await screenCattleHealth(input);
        setHealthByCattleId((prev) => ({
          ...prev,
          [input.cattleId]: res,
        }));
        setHealthHistoryByCattleId((prev) => ({
          ...prev,
          [input.cattleId]: [res, ...(prev[input.cattleId] || [])].slice(0, 10),
        }));
        if (res.source) setApiMode(res.source);
        return res;
      } finally {
        setIsScreening(false);
      }
    },
    []
  );

  const resetAllDemoData = useCallback(async () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.barns);
      localStorage.removeItem(STORAGE_KEYS.breeds);
      localStorage.removeItem(STORAGE_KEYS.farmSettings);
      localStorage.removeItem(STORAGE_KEYS.cattleList);
      localStorage.removeItem(STORAGE_KEYS.activeCattleId);
      localStorage.removeItem(STORAGE_KEYS.feeds);
      localStorage.removeItem(STORAGE_KEYS.healthMap);
      localStorage.removeItem(STORAGE_KEYS.healthHistoryMap);
      localStorage.removeItem(STORAGE_KEYS.aiRecommendations);
    } catch {
      // Ignore
    }
    const { feeds: defFeeds, source } = await getDefaultFeeds();
    setBarns(DEFAULT_BARNS);
    setBreeds(DEFAULT_BREEDS);
    setFarmSettings(DEFAULT_FARM_SETTINGS);
    setCattleList(DEFAULT_CATTLE_LIST);
    setActiveCattleId(DEFAULT_CATTLE_LIST[0].id);
    setFeeds(defFeeds);
    setHealthByCattleId(buildInitialHealthMap(DEFAULT_CATTLE_LIST));
    setHealthHistoryByCattleId(buildInitialHistoryMap(DEFAULT_CATTLE_LIST));
    setAiRecommendationsByCattleId({});
    setOptimizationByCattleId(
      buildFallbackOptimizationMap(
        DEFAULT_CATTLE_LIST,
        defFeeds,
        DEFAULT_BREEDS
      )
    );
    setApiMode(source);
    await runOptimizationForCattle(
      DEFAULT_CATTLE_LIST[0],
      defFeeds,
      DEFAULT_BREEDS
    );
  }, [runOptimizationForCattle]);

  const saveAiRecommendation = useCallback(
    (cattleId: string, recommendation: AiRationRecommendation) => {
      setAiRecommendationsByCattleId((prev) => {
        const next = { ...prev, [cattleId]: recommendation };
        try {
          localStorage.setItem(
            STORAGE_KEYS.aiRecommendations,
            JSON.stringify(next)
          );
        } catch (err) {
          console.error("Gagal menyimpan rekomendasi AI ke localStorage", err);
        }
        return next;
      });
    },
    []
  );

  const clearAiRecommendation = useCallback((cattleId: string) => {
    setAiRecommendationsByCattleId((prev) => {
      const next = { ...prev };
      delete next[cattleId];
      try {
        localStorage.setItem(
          STORAGE_KEYS.aiRecommendations,
          JSON.stringify(next)
        );
      } catch (err) {
        console.error("Gagal mengupdate rekomendasi AI di localStorage", err);
      }
      return next;
    });
  }, []);

  const value = useMemo<AppStateContextValue>(
    () => ({
      isHydrated,
      apiMode,
      currentUser,
      isAuthenticated: Boolean(currentUser),
      login,
      registerUser,
      logout,
      barns,
      addBarn,
      updateBarn,
      deleteBarn,
      breeds,
      addBreed,
      updateBreed,
      deleteBreed,
      farmSettings,
      updateFarmSettings,
      feeds,
      updateFeedItem,
      addCustomFeed,
      deleteFeedItem,
      resetDefaultFeeds,
      cattleList,
      activeCattleId,
      getNextDefaultCattleName,
      healthByCattleId,
      optimizationByCattleId,
      selectActiveCattle,
      createCattle,
      updateCattleById,
      deleteCattleById,
      profile,
      optimizationResult,
      healthStatus,
      healthHistory,
      daysToQurban,
      isOptimizing,
      isScreening,
      updateProfile,
      addWeightLog,
      removeWeightLog,
      runOptimization,
      runHealthScreening,
      resetAllDemoData,
      aiRecommendationsByCattleId,
      saveAiRecommendation,
      clearAiRecommendation,
    }),
    [
      isHydrated,
      apiMode,
      currentUser,
      login,
      registerUser,
      logout,
      barns,
      addBarn,
      updateBarn,
      deleteBarn,
      breeds,
      addBreed,
      updateBreed,
      deleteBreed,
      farmSettings,
      updateFarmSettings,
      feeds,
      updateFeedItem,
      addCustomFeed,
      deleteFeedItem,
      resetDefaultFeeds,
      cattleList,
      activeCattleId,
      getNextDefaultCattleName,
      healthByCattleId,
      optimizationByCattleId,
      selectActiveCattle,
      createCattle,
      updateCattleById,
      deleteCattleById,
      profile,
      optimizationResult,
      healthStatus,
      healthHistory,
      daysToQurban,
      isOptimizing,
      isScreening,
      updateProfile,
      addWeightLog,
      removeWeightLog,
      runOptimization,
      runHealthScreening,
      resetAllDemoData,
      aiRecommendationsByCattleId,
      saveAiRecommendation,
      clearAiRecommendation,
    ]
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState harus digunakan di dalam AppStateProvider");
  }
  return ctx;
}
