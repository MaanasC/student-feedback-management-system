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
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
  ListPlus
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";

export function FeedbackFormManagementPage() {
  const { feedbackForms, addFeedbackForm, toggleFormStatus, navigateTo } = useApp();

  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [termFilter, setTermFilter] = useState("Fall 2024");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [courseCode, setCourseCode] = useState("CS101");
  const [facultyName, setFacultyName] = useState("Dr. Alan Turing");
  const [semester, setSemester] = useState("Fall 2024");
  const [startDate, setStartDate] = useState("2024-11-01");
  const [endDate, setEndDate] = useState("2024-11-15");
  const [newQuestions, setNewQuestions] = useState([
    { questionText: "How effectively did the instructor present core concepts?", questionType: "Rating", required: true },
    { questionText: "Rate the pace and helpfulness of coursework materials.", questionType: "Rating", required: true }
  ]);

  const filteredForms = feedbackForms.filter((f) => {
    const matchesStatus =
      statusFilter === "All Statuses" || f.status === statusFilter;
    const matchesTerm =
      termFilter === "All Terms" || f.semester === termFilter;
    return matchesStatus && matchesTerm;
  });

  const handleAddQuestionRow = () => {
    setNewQuestions([
      ...newQuestions,
      { questionText: "", questionType: "Rating", required: true }
    ]);
  };

  const handleCreateForm = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert("Please provide a Title for the feedback form.");
      return;
    }

    addFeedbackForm({
      courseCode,
      courseName: "Applied Academic Course",
      facultyName,
      title: formTitle,
      semester,
      status: "Active",
      startDate,
      endDate,
      deadlineNote: "Active Evaluation",
      questions: newQuestions
    });

    setIsModalOpen(false);
    setFormTitle("");
  };

  return (
    <div className="space-y-8">
      {/* Title & Add New Form button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Feedback Forms
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Manage course evaluation forms and surveys across all departments
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setIsModalOpen(true)}
        >
          Add New Form
        </Button>
      </div>

      {/* Filter Controls Bar (matches Wireframe 10) */}
      <Card className="p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                Department
              </label>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>All Departments</option>
                <option>Computer Science</option>
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Business</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>All Statuses</option>
                <option>Active</option>
                <option>Draft</option>
                <option>Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                Term
              </label>
              <select
                value={termFilter}
                onChange={(e) => setTermFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Fall 2024</option>
                <option>Spring 2024</option>
                <option>All Terms</option>
              </select>
            </div>
          </div>

          <div className="sm:self-end">
            <Button
              variant="secondary"
              size="md"
              onClick={() => alert("Filters applied successfully")}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Forms Table (matches Wireframe 10) */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-4 px-6">Course</th>
                <th className="py-4 px-5">Faculty</th>
                <th className="py-4 px-5">Questions</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Period</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredForms.map((f) => (
                <tr key={f.formId} className="hover:bg-slate-50/80 transition">
                  <td className="py-4 px-6">
                    <span className="block font-bold text-slate-900 text-sm">
                      {f.courseCode}: {f.courseName}
                    </span>
                    <span className="block text-xs text-slate-500 mt-0.5">
                      {f.title || "Course Evaluation"}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-slate-700 font-semibold">
                    {f.facultyName}
                  </td>
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center justify-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                      {f.questionsCount || 4}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <Badge variant={f.status.toLowerCase()}>{f.status}</Badge>
                  </td>
                  <td className="py-4 px-5">
                    <div className="text-slate-800 font-medium">
                      {f.startDate || "Oct 15"} - {f.endDate || "Nov 01"}
                    </div>
                    {f.deadlineNote && (
                      <span className="text-xs text-slate-400 mt-0.5 block">
                        {f.deadlineNote}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        onClick={() => toggleFormStatus(f.formId)}
                        className={`rounded px-2.5 py-1.5 text-xs font-semibold border transition ${
                          f.status === "Active"
                            ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }`}
                        title="Toggle Active/Inactive"
                      >
                        {f.status === "Active" ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        onClick={() => navigateTo("feedback-form", f)}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition"
                        title="Preview Form"
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 px-6 py-4 text-sm text-slate-500 gap-3">
          <span>Showing 1 to {filteredForms.length} of 24 forms</span>

          <div className="flex items-center gap-1.5">
            <button className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 font-bold text-white shadow-xs">
              1
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
              2
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
              3
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Add New Form Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Configure New Feedback Form"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreateForm} className="space-y-5 text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Form Title
            </label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Mid-Term Evaluation Survey - CS101"
              className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Target Course
              </label>
              <select
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CS101">CS101: Intro to Programming</option>
                <option value="CS201">CS201: Intro to Computer Science</option>
                <option value="CS301">CS301: Data Structures</option>
                <option value="SE401">SE401: Web Development</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Faculty Evaluated
              </label>
              <input
                type="text"
                value={facultyName}
                onChange={(e) => setFacultyName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {newQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5"
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
                    className="flex-1 rounded border border-slate-300 bg-white p-2 text-sm text-slate-800"
                  />
                  <select
                    value={q.questionType}
                    onChange={(e) => {
                      const updated = [...newQuestions];
                      updated[idx].questionType = e.target.value;
                      setNewQuestions(updated);
                    }}
                    className="rounded border border-slate-300 bg-white p-2 text-sm text-slate-700"
                  >
                    <option value="Rating">1-5 Scale</option>
                    <option value="Text">Comment Box</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Publish Form
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default FeedbackFormManagementPage;
