// src/hooks/useVault.js
// Manages 3 named scenario slots, persisted in Supabase.
// Anonymous session = no login required, but data survives across devices
// as long as the same browser localStorage session token is present.

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase, getSessionId } from "../lib/supabaseClient.js";

const SLOT_IDS = ["utama", "optimis", "konservatif"];

const EMPTY_SLOTS = {
  utama:       { id: "utama",       label: { id: "Rencana Utama", en: "Main Plan"    }, scenario: null, engineResult: null, savedAt: null },
  optimis:     { id: "optimis",     label: { id: "Optimis",       en: "Optimistic"   }, scenario: null, engineResult: null, savedAt: null },
  konservatif: { id: "konservatif", label: { id: "Konservatif",   en: "Conservative" }, scenario: null, engineResult: null, savedAt: null },
};

export function useVault() {
  const [slots,     setSlots]     = useState({ ...EMPTY_SLOTS });
  const [loading,   setLoading]   = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const sessionRef = useRef(null);

  // ── Bootstrap: get session then load vault ──────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const sid = await getSessionId();
        setSessionId(sid);
        sessionRef.current = sid;
        await loadVault(sid);
      } catch (err) {
        console.error("[Vault] Init failed:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── Load all slots for this session ─────────────────────────────────────
  const loadVault = async (sid) => {
    if (!sid) return;
    const { data, error } = await supabase
      .from("vault_scenarios")
      .select("*")
      .eq("session_id", sid);

    if (error) {
      console.error("[Vault] Load failed:", error.message);
      return;
    }

    if (!data?.length) return;

    setSlots(prev => {
      const next = { ...prev };
      data.forEach(row => {
        if (next[row.slot_id]) {
          next[row.slot_id] = {
            ...next[row.slot_id],
            scenario:     row.scenario,
            engineResult: row.engine_result,
            savedAt:      row.saved_at,
            dbId:         row.id,
          };
        }
      });
      return next;
    });
  };

  // ── Save a scenario to a slot ────────────────────────────────────────────
  const saveToSlot = useCallback(async (slotId, scenario, engineResult) => {
    const sid = sessionRef.current;
    if (!sid) { console.warn("[Vault] No session — cannot save."); return; }

    const payload = {
      session_id:    sid,
      slot_id:       slotId,
      name:          scenario?.name ?? slotId,
      scenario:      scenario      ?? null,
      engine_result: engineResult
        ? { cashflow: engineResult.cashflow, verdict: engineResult.verdict }
        : null,
      saved_at:      new Date().toISOString(),
    };

    // Upsert: insert or update based on (session_id, slot_id) uniqueness
    const { data, error } = await supabase
      .from("vault_scenarios")
      .upsert(payload, { onConflict: "session_id,slot_id" })
      .select()
      .single();

    if (error) {
      console.error("[Vault] Save failed:", error.message);
      return;
    }

    setSlots(prev => ({
      ...prev,
      [slotId]: {
        ...prev[slotId],
        scenario,
        engineResult: payload.engine_result,
        savedAt:  data.saved_at,
        dbId:     data.id,
      },
    }));
  }, []);

  // ── Clear a slot ─────────────────────────────────────────────────────────
  const clearSlot = useCallback(async (slotId) => {
    const sid = sessionRef.current;
    if (!sid) return;

    const { error } = await supabase
      .from("vault_scenarios")
      .delete()
      .eq("session_id", sid)
      .eq("slot_id", slotId);

    if (error) { console.error("[Vault] Clear failed:", error.message); return; }

    setSlots(prev => ({
      ...prev,
      [slotId]: { ...EMPTY_SLOTS[slotId] },
    }));
  }, []);

  // ── Save screening profile ───────────────────────────────────────────────
  const saveProfile = useCallback(async (profile) => {
    const sid = sessionRef.current;
    if (!sid) return;

    await supabase
      .from("screening_profiles")
      .upsert({ session_id: sid, profile }, { onConflict: "session_id" });
  }, []);

  return {
    slots,
    loading,
    sessionId,
    saveToSlot,
    clearSlot,
    saveProfile,
    slotsArray: Object.values(slots),
    reload: () => loadVault(sessionRef.current),
  };
}
