/** Fields excluded from Zustand persist (transient UI state). */
export function omitTransient<T extends object, K extends keyof T>(
  state: T,
  keys: readonly K[],
): Omit<T, K> {
  const next = { ...state };
  for (const key of keys) delete (next as Record<string, unknown>)[key as string];
  return next as Omit<T, K>;
}

export const GUIDE_TRANSIENT = ["isGenerating", "error"] as const;
export const INTERVIEW_TRANSIENT = ["isGenerating", "isSuggesting", "error"] as const;
export const PROCESS_MAP_TRANSIENT = ["isGenerating", "isRefining", "error"] as const;
export const INITIATIVE_TRANSIENT = ["isGenerating", "error"] as const;
