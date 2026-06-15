import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { complete, hasLlm } from "@/lib/llm/client";
import {
  PROCESS_MAP_SYSTEM_PROMPT,
  buildRefinePrompt,
} from "@/lib/prompts/process-mapping";
import type { ProcessMapDocument, RefineTarget } from "@/types/process-map";

function applyRefinement(
  doc: ProcessMapDocument,
  target: RefineTarget,
  patch: Partial<ProcessMapDocument>,
): ProcessMapDocument {
  const updated = { ...doc, updatedAt: new Date().toISOString() };

  switch (target) {
    case "full_map":
      return { ...updated, ...patch, id: doc.id, refinements: doc.refinements };
    case "process_steps":
      return { ...updated, steps: patch.steps ?? doc.steps };
    case "pain_points":
      return { ...updated, painPoints: patch.painPoints ?? doc.painPoints };
    case "improvements":
      return { ...updated, improvements: patch.improvements ?? doc.improvements };
    case "narrative":
      return {
        ...updated,
        narrativeSummary: patch.narrativeSummary ?? doc.narrativeSummary,
      };
    default:
      return updated;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const document = body.document as ProcessMapDocument;
    const target = body.target as RefineTarget;
    const feedback = (body.feedback ?? "") as string;

    if (!document || !target || !feedback.trim()) {
      return NextResponse.json({ error: "Document, target, and feedback required" }, { status: 400 });
    }

    if (!hasLlm()) {
      const updated = applyRefinement(document, target, {
        narrativeSummary:
          target === "narrative" || target === "full_map"
            ? `${document.narrativeSummary}\n\n[Refinement note: ${feedback}]`
            : document.narrativeSummary,
        improvements:
          target === "improvements" || target === "full_map"
            ? document.improvements.map((imp, i) =>
                i === 0
                  ? { ...imp, description: `${imp.description} (Refined: ${feedback.slice(0, 80)})` }
                  : imp,
              )
            : document.improvements,
      });
      return NextResponse.json({ document: updated, mode: "template" });
    }

    const raw = await complete(
      PROCESS_MAP_SYSTEM_PROMPT,
      buildRefinePrompt(target, feedback, document),
      { json: true, temperature: 0.3 },
    );

    const patch = JSON.parse(raw) as Partial<ProcessMapDocument>;
    const updated = applyRefinement(document, target, patch);

    if (target === "process_steps" && patch.steps) {
      updated.steps = patch.steps.map((s, i) => ({
        ...s,
        id: s.id || document.steps[i]?.id || uuidv4(),
      }));
    }
    if (target === "pain_points" && patch.painPoints) {
      updated.painPoints = patch.painPoints.map((p, i) => ({
        ...p,
        id: p.id || document.painPoints[i]?.id || uuidv4(),
      }));
    }
    if (target === "improvements" && patch.improvements) {
      updated.improvements = patch.improvements.map((imp, i) => ({
        ...imp,
        id: imp.id || document.improvements[i]?.id || uuidv4(),
      }));
    }

    return NextResponse.json({ document: updated, mode: "llm" });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Refinement failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
