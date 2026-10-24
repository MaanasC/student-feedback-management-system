import React from "react";
import { CheckCircle2, Calendar, BookOpen, User, ShieldCheck } from "lucide-react";
import { useApp } from "../../context/AppContext";
import Button from "../../components/common/Button";

export function FeedbackConfirmationPage() {
  const { lastSubmission, navigateTo } = useApp();

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-2xl flex-col items-center justify-center py-10 px-4">
      {/* Confirmation Card */}
      <div className="w-full rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-12 text-center shadow-lg space-y-8">
        {/* Animated Checkmark Circle */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-8 ring-blue-50">
          <CheckCircle2 className="h-12 w-12 text-blue-600" />
        </div>

        {/* Heading & Subtext */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">
            Feedback Submitted Successfully
          </h1>
          <p className="text-sm leading-relaxed text-slate-500 max-w-md mx-auto">
            Thank you for your constructive feedback. It helps us improve our academic and teaching standards.
          </p>
        </div>

        {/* Metadata Details Card */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-6 text-left space-y-4">
          <div className="flex items-center justify-between text-sm border-b border-slate-200/60 pb-3">
            <span className="font-semibold text-slate-400">Course</span>
            <span className="font-bold text-slate-800">
              {lastSubmission?.courseName || "CS201: Introduction to Computer Science"}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm border-b border-slate-200/60 pb-3">
            <span className="font-semibold text-slate-400">Faculty</span>
            <span className="font-bold text-slate-800">
              {lastSubmission?.facultyName || "Dr. Alan Turing"}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm border-b border-slate-200/60 pb-3">
            <span className="font-semibold text-slate-400">Submission Date</span>
            <span className="font-bold text-slate-800">
              {lastSubmission?.submittedAt || "October 24, 2026"}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-400">Verification ID</span>
            <span className="font-mono text-xs sm:text-sm font-bold text-blue-600">
              {lastSubmission?.submissionId || "SFB-892341"}
            </span>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Responses are encrypted and strictly confidential</span>
        </div>

        {/* Return Button */}
        <div className="pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigateTo("student-dashboard")}
            className="w-full py-3.5 rounded-xl text-sm font-bold shadow-md"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FeedbackConfirmationPage;
