"use client";

import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";

interface StageFooterProps {
  stage: number;
  isGenerating?: boolean;
  onBack?: () => void;
  onContinue?: () => void;
  onGenerate?: () => void;
  continueLabel?: string;
  generateLabel?: string;
  showSkip?: boolean;
  onSkip?: () => void;
  skipLabel?: string;
}

export function StageFooter({
  stage,
  isGenerating,
  onBack,
  onContinue,
  onGenerate,
  continueLabel = "Continue",
  generateLabel = "Generate & review",
  showSkip,
  onSkip,
  skipLabel = "Generate without sources",
}: StageFooterProps) {
  return (
    <div className="stage-footer">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {stage > 1 && onBack ? (
          <button type="button" onClick={onBack} disabled={isGenerating} className="btn-secondary">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        ) : (
          <div />
        )}

        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {showSkip && onSkip && stage === 2 && (
            <button
              type="button"
              onClick={onSkip}
              disabled={isGenerating}
              className="btn-secondary text-xs"
            >
              {skipLabel}
            </button>
          )}
          {stage < 2 && onContinue && (
            <button type="button" onClick={onContinue} className="btn-primary">
              {continueLabel}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
          {stage === 2 && onGenerate && (
            <button
              type="button"
              onClick={onGenerate}
              disabled={isGenerating}
              className="btn-primary"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {generateLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
