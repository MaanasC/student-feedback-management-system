import React, { useState, useEffect } from "react";
import { Info, Check, ArrowLeft, Send, Clock, Sparkles } from "lucide-react";
import { useApp } from "../../context/AppContext";
import Button from "../../components/common/Button";

export function FeedbackFormPage() {
  const { activeFeedbackForm, submitFeedback, navigateTo } = useApp();

  const questions = activeFeedbackForm?.questions?.length
    ? activeFeedbackForm.questions
    : [
        {
          questionId: "q_1",
          questionText: "How clearly did the instructor explain complex concepts?",
          questionType: "Rating",
          required: true
        },
        {
          questionId: "q_2",
          questionText: "Rate the instructor's subject knowledge and responsiveness to questions.",
          questionType: "Rating",
          required: true
        },
        {
          questionId: "q_3",
          questionText: "How well organized and paced were the classroom lectures and syllabus?",
          questionType: "Rating",
          required: true
        },
        {
          questionId: "q_4",
          questionText: "Rate the fairness and transparency of grading and assessment criteria.",
          questionType: "Rating",
          required: true
        }
      ];

  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [lastAutoSaved, setLastAutoSaved] = useState(null);

  useEffect(() => {
    if (Object.keys(ratings).length > 0 || comments.length > 0) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastAutoSaved(timeStr);
    }
  }, [ratings, comments]);

  const handleRatingClick = (questionId, value) => {
    setRatings((prev) => ({
      ...prev,
      [questionId]: value
    }));
    setErrorMsg("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const unanswered = questions.filter(
      (q) => q.required && !ratings[q.questionId]
    );

    if (unanswered.length > 0) {
      setErrorMsg(
        `Please rate all required questions (${unanswered.length} unanswered).`
      );
      return;
    }

    const values = Object.values(ratings);
    const avg = values.length
      ? +(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
      : 5.0;

    submitFeedback({
      courseCode: activeFeedbackForm?.courseCode || "CS201",
      courseName: activeFeedbackForm?.courseName || "Introduction to Computer Science",
      facultyName: activeFeedbackForm?.facultyName || "Dr. Alan Turing",
      ratings,
      comments,
      averageScore: avg
    });
  };

  const answeredCount = Object.keys(ratings).length;

  return (
    <div className="mx-auto max-w-4xl py-6 space-y-8">
      {/* Navigation header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo("student-dashboard")}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>

        {lastAutoSaved && (
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <Clock className="h-3.5 w-3.5" />
            <span>Draft auto-saved at {lastAutoSaved}</span>
          </span>
        )}
      </div>

      {/* Main Feedback Form Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-12 shadow-sm space-y-10">
        {/* Course & Faculty Header */}
        <div className="text-center space-y-2">
          <div className="inline-block rounded-full bg-blue-50 px-4 py-1 text-xs font-extrabold text-blue-700 tracking-wide uppercase mb-1">
            Course Evaluation
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-700 sm:text-4xl">
            {activeFeedbackForm?.courseCode || "CS201"}:{" "}
            {activeFeedbackForm?.courseName || "Introduction to Computer Science"}
          </h1>
          <p className="text-base font-medium text-slate-600">
            Instructor: {activeFeedbackForm?.facultyName || "Dr. Alan Turing"}
          </p>
        </div>

        {/* Progress Bar indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-500">
            <span>Evaluation Progress</span>
            <span>{answeredCount} of {questions.length} Questions Completed</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
            />
          </div>
        </div>

        {/* Anonymity Banner */}
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-6 py-4 text-xs sm:text-sm font-medium text-slate-600">
          <Info className="h-5 w-5 text-blue-600 shrink-0" />
          <span>Your feedback is anonymous and helps improve our teaching standards.</span>
        </div>

        {/* Error notification via Conditional Rendering */}
        {errorMsg && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700 font-bold text-center">
            {errorMsg}
          </div>
        )}

        {/* Dynamic Rendering of Feedback Questions using .map() */}
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-8 divide-y divide-slate-100">
            {questions.map((q, index) => {
              const currentVal = ratings[q.questionId];
              return (
                <div key={q.questionId} className={`${index > 0 ? "pt-8" : ""} space-y-4`}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-base sm:text-lg font-bold text-slate-800">
                      {index + 1}. {q.questionText}
                    </p>
                    {q.required && (
                      <span className="text-xs font-bold text-rose-500 shrink-0">
                        *Required
                      </span>
                    )}
                  </div>

                  {/* 1-5 scale buttons */}
                  <div className="grid grid-cols-5 gap-3 sm:gap-4">
                    {[1, 2, 3, 4, 5].map((val) => {
                      const isSelected = currentVal === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleRatingClick(q.questionId, val)}
                          className={`flex flex-col items-center justify-center rounded-2xl border py-4 sm:py-5 transition-all font-bold ${
                            isSelected
                              ? "border-blue-600 bg-blue-50/90 text-blue-700 shadow-md ring-2 ring-blue-500/20"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <span className="text-xl sm:text-2xl font-black">{val}</span>
                          {val === 1 && (
                            <span className="mt-1 text-xs text-slate-400 font-medium">
                              Poor
                            </span>
                          )}
                          {val === 5 && (
                            <span className="mt-1 text-xs text-slate-400 font-medium">
                              Excellent
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Comments Textarea */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="comments"
                className="block text-base font-bold text-slate-800"
              >
                Additional Comments or Suggestions (Optional)
              </label>
              <span className="text-xs text-slate-400 font-medium">
                {comments.length}/500 chars
              </span>
            </div>
            <textarea
              id="comments"
              rows={4}
              maxLength={500}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Tell us what you liked or how the instructor can improve..."
              className="w-full rounded-2xl border border-slate-300 p-4 text-sm md:text-base text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
            />
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => navigateTo("student-dashboard")}
              className="px-6 py-3 rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="px-8 py-3.5 rounded-xl font-bold shadow-md"
            >
              <span>Submit Feedback</span>
              <Send className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FeedbackFormPage;
