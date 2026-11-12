import React from "react";
import { CheckCircle2, MessageSquare, Star, User, BookOpen, Clock, ShieldCheck } from "lucide-react";
import Modal from "./Modal";
import Badge from "./Badge";
import Button from "./Button";
import { useApp } from "../../context/AppContext";

export function SubmissionReviewModal() {
  const { isReviewModalOpen, closeSubmissionReview, selectedSubmissionForReview } = useApp();

  if (!selectedSubmissionForReview) return null;

  const sub = selectedSubmissionForReview;
  const courseCode = sub.courseId?.courseCode || sub.courseCode || "Course";
  const courseName = sub.courseId?.courseName || sub.courseName || "";
  const facultyName = sub.facultyId?.userId?.name || sub.facultyName || "Faculty Member";
  const responseId = sub.responseId || sub._id || "RESP-RECORD";
  const submittedAtFormatted = sub.submittedAt
    ? new Date(sub.submittedAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Recently";

  // Ratings with question text
  const ratings = sub.ratingsWithQuestions || sub.ratings || [];

  return (
    <Modal
      isOpen={isReviewModalOpen}
      onClose={closeSubmissionReview}
      title="Student Feedback Submission Review"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 text-sm">
        {/* Header Summary Pill */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-blue-700 text-base">{courseCode}</span>
              <span className="text-slate-700 font-bold">{courseName}</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Instructor: {facultyName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="active" size="md">
              {responseId}
            </Badge>
          </div>
        </div>

        {/* Anonymity watermark */}
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
          <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
          <span>Student identity is protected under university academic feedback privacy policy.</span>
        </div>

        {/* Questions and Ratings */}
        <div className="space-y-3.5">
          <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
            Evaluation Ratings ({ratings.length} Criteria)
          </h4>

          <div className="space-y-2.5">
            {ratings.map((item, idx) => {
              const qText =
                item.questionText ||
                `Evaluation Criterion ${item.questionId || idx + 1}`;
              const val = item.ratingValue || 5;

              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex-1 pr-2">
                    <p className="text-xs sm:text-sm font-semibold text-slate-800">
                      {idx + 1}. {qText}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                    <span className="font-extrabold text-amber-700 text-sm">{val} / 5</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Qualitative Comments */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
            Written Student Feedback
          </h4>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5">
            <span className="block text-xs font-bold text-slate-500">Student Comments:</span>
            <p className="text-sm text-slate-800 font-medium italic">
              "{sub.comments || "No general comments provided."}"
            </p>
          </div>

          {sub.suggestions && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5">
              <span className="block text-xs font-bold text-slate-500">Recommendations for Improvement:</span>
              <p className="text-sm text-slate-800 font-medium italic">
                "{sub.suggestions}"
              </p>
            </div>
          )}
        </div>

        {/* Submission Timestamp footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Submitted: {submittedAtFormatted}
          </span>
          <Button variant="secondary" size="sm" onClick={closeSubmissionReview}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default SubmissionReviewModal;
