import { v4 as uuidv4 } from "uuid";
import type { InterviewRun } from "@/types/interview-execution";
import {
  buildInterviewRunFromFlat,
  captureFlatFromRun,
  runLabelForStakeholder,
  type InterviewRunFlatState,
} from "@/lib/interview-execution/logic";

export function flushActiveRun(state: {
  activeRunId: string | null;
  interviewRuns: InterviewRun[];
} & InterviewRunFlatState): InterviewRun[] {
  if (!state.activeRunId) return state.interviewRuns;
  const now = new Date().toISOString();
  const idx = state.interviewRuns.findIndex((r) => r.id === state.activeRunId);
  const label =
    idx >= 0
      ? runLabelForStakeholder(state.stakeholderName, idx + 1)
      : runLabelForStakeholder(state.stakeholderName, state.interviewRuns.length + 1);
  const run = buildInterviewRunFromFlat(state, state.activeRunId, label, {
    createdAt: idx >= 0 ? state.interviewRuns[idx].createdAt : now,
    updatedAt: now,
  });
  if (idx >= 0) {
    return state.interviewRuns.map((r) => (r.id === state.activeRunId ? run : r));
  }
  return [...state.interviewRuns, run];
}

export function applyRunToFlat(run: InterviewRun): InterviewRunFlatState {
  return captureFlatFromRun(run);
}

export function ensureRuns(state: {
  activeRunId: string | null;
  interviewRuns: InterviewRun[];
} & InterviewRunFlatState): { interviewRuns: InterviewRun[]; activeRunId: string } {
  if (state.interviewRuns.length > 0 && state.activeRunId) {
    return { interviewRuns: flushActiveRun(state), activeRunId: state.activeRunId };
  }
  const id = uuidv4();
  const run = buildInterviewRunFromFlat(state, id, runLabelForStakeholder(state.stakeholderName, 1));
  return { interviewRuns: [run], activeRunId: id };
}

export function withActiveRunPatch(
  state: { activeRunId: string | null; interviewRuns: InterviewRun[] } & InterviewRunFlatState,
  patch: Partial<InterviewRunFlatState>,
): { interviewRuns: InterviewRun[] } {
  const ensured = ensureRuns(state);
  const merged = { ...state, ...patch, ...ensured };
  return { interviewRuns: flushActiveRun(merged) };
}
