import React, { useState } from "react";
import {
  Plus,
  Filter,
  Search,
  CheckCircle,
  Clock,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ListPlus,
  MessageSquare,
  FileText,
  Star,
  Layers,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import { api } from "../../services/api";

export function FeedbackFormManagementPage() {
  const {
    feedbackForms,
    addFeedbackForm,
    toggleFormStatus,
    navigateTo,
    courses = [],
    openSubmissionReview,
  } = useApp();

  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [termFilter, setTermFilter] = useState("All Terms");

  // Modal State for New Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [courseCode, setCourseCode] = useState(courses[0]?.courseCode || "CS101");
  const [facultyName, setFacultyName] = useState(courses[0]?.facultyName || "Dr. Alan Turing");
  const [semester, setSemester] = useState("Fall 2024");
  const [startDate, setStartDate] = useState("2024-11-01");
  const [endDate, setEndDate] = useState("2024-12-15");
  const [newQuestions, setNewQuestions] = useState([
    { questionId: "Q1", questionText: "How effectively did the instructor present core concepts?", questionType: "Rating", required: true },
    { questionId: "Q2", questionText: "Rate the pace and helpfulness of coursework materials.", questionType: "Rating", required: true },
    { questionId: "Q3", questionText: "How approachable and responsive was the instructor?", questionType: "Rating", required: true },
    { questionId: "Q4", questionText: "Overall satisfaction with learning outcomes and labs.", questionType: "Rating", required: true },
  ]);

  // Submissions Modal State (for viewing student responses on a form)
  const [selectedFormForSubmissions, setSelectedFormForSubmissions] = useState(null);
  const [formSubmissions, setFormSubmissions] = useState([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);

  const filteredForms = feedbackForms.filter((f) => {
    const matchesStatus =
      statusFilter === "All Statuses" || f.status === statusFilter;
    const matchesTerm =
      termFilter === "All Terms" || f.semester === termFilter;
    return matchesStatus && matchesTerm;
  });

  const handleAddQuestionRow = () => {
    const nextNum = newQuestions.length + 1;
    setNewQuestions([
      ...newQuestions,
      { questionId: `Q${nextNum}`, questionText: "", questionType: "Rating", required: true },
    ]);
  };

  const handleSaveForm = (statusToSave = "Active") => {
    if (!formTitle.trim()) {
      alert("Please provide a Title for the feedback form.");
      return;
    }

    const selectedCourse = courses.find((c) => c.courseCode === courseCode) || courses[0];
    const facultyId =
      selectedCourse?.facultyIds?.[0]?._id ||
      selectedCourse?.facultyIds?.[0] ||
      "6af490d99ee1cc62c34ac8d2";

    addFeedbackForm({
      courseId: selectedCourse?.courseId || selectedCourse?._id,
      facultyId,
      courseCode: selectedCourse?.courseCode || courseCode,
      courseName: selectedCourse?.courseName || formTitle,
      facultyName: selectedCourse?.facultyName || facultyName,
      title: formTitle,
      semester,
      status: statusToSave, // 'Draft' or 'Active'
      startDate,
      endDate,
      deadlineNote: statusToSave === "Draft" ? "Draft Form" : "Active Evaluation",
      questions: newQuestions,
    });

    setIsModalOpen(false);
    setFormTitle("");
  };

  const handleOpenSubmissions = async (form) => {
    setSelectedFormForSubmissions(form);
    setIsLoadingSubmissions(true);
    setIsSubmissionsModalOpen(true);

    try {
      const res = await api.getResponsesByForm(form.formId);
      if (res && res.success && Array.isArray(res.responses)) {
        setFormSubmissions(res.responses);
      } else {
        setFormSubmissions([]);
      }
    } catch (e) {
      setFormSubmissions([]);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Title & Add New Form button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-800">
            Feedback Forms
          </h1>
          <p className="mt-2 text-sm md:text-base font-medium text-slate-500">
            Configure, publish, and monitor student evaluation surveys across academic courses
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          icon={Plus}
          onClick={() => {
            if (courses.length > 0) {
              setCourseCode(courses[0].courseCode);
              setFacultyName(courses[0].facultyName || "Dr. Alan Turing");
            }
            setIsModalOpen(true);
          }}
          className="rounded-xl font-bold py-2.5 px-5 shadow-sm"
        >
          Add New Form
        </Button>
      </div>

      {/* Filter Controls Bar */}
      <Card className="p-5 md:p-6 rounded-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                Department
              </label>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option>All Departments</option>
                <option>Computer Science</option>
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Engineering</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option>All Statuses</option>
                <option>Active</option>
                <option>Draft</option>
                <option>Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                Academic Term
              </label>
              <select
                value={termFilter}
                onChange={(e) => setTermFilter(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option>All Terms</option>
                <option>Fall 2024</option>
                <option>Spring 2024</option>
              </select>
            </div>
          </div>

          {(statusFilter !== "All Statuses" || termFilter !== "All Terms" || deptFilter !== "All Departments") && (
            <button
              onClick={() => {
                setStatusFilter("All Statuses");
                setTermFilter("All Terms");
                setDeptFilter("All Departments");
              }}
              className="text-xs sm:text-sm font-bold text-blue-600 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </Card>

      {/* Forms Table */}
      <Card className="p-0 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-xs border-b border-slate-200">
              <tr>
                <th className="py-4 px-6">Course & Title</th>
                <th className="py-4 px-5">Faculty</th>
                <th className="py-4 px-5">Questions</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Timeline</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredForms.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No evaluation forms matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredForms.map((f) => (
                  <tr key={f.formId} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6">
                      <span className="block font-bold text-slate-900 text-sm">
                        {f.courseCode}: {f.courseName}
                      </span>
                      <span className="block text-xs text-slate-400 mt-0.5">
                        {f.title || "Course Evaluation"}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-700 font-semibold">
                      {f.facultyName}
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                        {f.questionsCount || f.questions?.length || 4}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${
                          f.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : f.status === "Draft"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="text-slate-800 text-xs font-semibold">
                        {f.startDate || "Oct 15"} - {f.endDate || "Nov 15"}
                      </div>
                      {f.deadlineNote && (
                        <span className="text-[11px] text-slate-400 mt-0.5 block">
                          {f.deadlineNote}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Submissions button */}
                        <button
                          onClick={() => handleOpenSubmissions(f)}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition flex items-center gap-1.5"
                          title="View Student Responses"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>Submissions</span>
                        </button>

                        {/* Status Toggle Button (Publish / Deactivate) */}
                        <button
                          onClick={() => toggleFormStatus(f.formId)}
                          className={`rounded-lg px-2.5 py-1.5 text-xs font-bold border transition ${
                            f.status === "Active"
                              ? "border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100"
                              : "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                          }`}
                          title={f.status === "Active" ? "Close Form to pause submissions" : "Publish Form"}
                        >
                          {f.status === "Active" ? "Close Form" : "Publish Form"}
                        </button>

                        {/* Preview button */}
                        <button
                          onClick={() => navigateTo("feedback-form", f)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition"
                          title="Preview Student View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Submissions List Modal for a selected Form */}
      <Modal
        isOpen={isSubmissionsModalOpen}
        onClose={() => setIsSubmissionsModalOpen(false)}
        title={`Student Submissions — ${selectedFormForSubmissions?.courseCode || "Course"}`}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 font-medium">
            Form: <span className="font-bold text-slate-800">{selectedFormForSubmissions?.title}</span> • Instructor:{" "}
            <span className="font-bold text-slate-800">{selectedFormForSubmissions?.facultyName}</span>
          </p>

          {isLoadingSubmissions ? (
            <div className="py-12 text-center text-sm font-semibold text-slate-500">
              Loading submissions from MongoDB...
            </div>
          ) : formSubmissions.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No student submissions received for this form yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
              {formSubmissions.map((sub, idx) => (
                <div
                  key={sub._id || idx}
                  className="py-3 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 rounded-xl transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">
                        {sub.responseId || `RESP-${idx + 1}`}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : "Recently"}
                      </span>
                    </div>
                    {sub.comments && (
                      <p className="text-xs text-slate-600 italic line-clamp-1">
                        "{sub.comments}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        openSubmissionReview(sub._id || sub.responseId);
                      }}
                      className="rounded-lg px-3 py-1.5 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-1.5 shadow-xs"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>View Answers</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button variant="secondary" size="md" onClick={() => setIsSubmissionsModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add New Form Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Configure New Feedback Form"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-5 text-sm">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Form Title
            </label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Mid-Term Evaluation Survey - CS101"
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Target Course
              </label>
              <select
                value={courseCode}
                onChange={(e) => {
                  setCourseCode(e.target.value);
                  const found = courses.find((c) => c.courseCode === e.target.value);
                  if (found) {
                    setFacultyName(found.facultyName || "Dr. Alan Turing");
                  }
                }}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {courses.length > 0 ? (
                  courses.map((c) => (
                    <option key={c.courseCode} value={c.courseCode}>
                      {c.courseCode}: {c.courseName}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="CS101">CS101: Intro to Programming</option>
                    <option value="CS201">CS201: Intro to Computer Science</option>
                    <option value="CS301">CS301: Data Structures</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Faculty Evaluated
              </label>
              <input
                type="text"
                value={facultyName}
                onChange={(e) => setFacultyName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                End Date (Deadline)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Questions configuration */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2.5">
              <label className="font-bold text-slate-800">
                Feedback Questions ({newQuestions.length})
              </label>
              <button
                type="button"
                onClick={handleAddQuestionRow}
                className="text-xs sm:text-sm font-bold text-blue-600 hover:underline flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {newQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5"
                >
                  <span className="text-slate-400 font-bold w-5">{idx + 1}.</span>
                  <input
                    type="text"
                    required
                    value={q.questionText}
                    onChange={(e) => {
                      const updated = [...newQuestions];
                      updated[idx].questionText = e.target.value;
                      setNewQuestions(updated);
                    }}
                    placeholder="Enter question text..."
                    className="flex-1 rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800"
                  />
                  <select
                    value={q.questionType}
                    onChange={(e) => {
                      const updated = [...newQuestions];
                      updated[idx].questionType = e.target.value;
                      setNewQuestions(updated);
                    }}
                    className="rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-700"
                  >
                    <option value="Rating">1-5 Scale</option>
                    <option value="Text">Comment Box</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Actions: Save as Draft OR Publish Form */}
          <div className="flex items-center justify-between pt-5 border-t border-slate-100">
            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleSaveForm("Draft")}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
              >
                Save as Draft
              </button>
              <Button
                variant="primary"
                size="md"
                type="button"
                onClick={() => handleSaveForm("Active")}
                className="rounded-xl font-bold py-2.5 px-5 shadow-sm"
              >
                Publish Form
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default FeedbackFormManagementPage;
