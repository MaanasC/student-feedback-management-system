import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  BookOpen,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertTriangle,
  GraduationCap,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";

export function CourseManagementPage() {
  const { courses = [], addCourse, updateCourse, deleteCourse, users = [], feedbackForms = [] } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [semesterFilter, setSemesterFilter] = useState("All Semesters");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Available faculty for instructor assignment
  const facultyUsers = useMemo(() => {
    return users.filter((u) => u.role === "Faculty");
  }, [users]);

  const [formData, setFormData] = useState({
    courseCode: "",
    courseName: "",
    department: "Computer Science",
    semester: "Fall 2024",
    facultyId: "",
    credits: 4,
    enrolledCount: 60,
    status: "Active",
  });

  // Calculate live associated forms and submissions for each course
  const coursesWithAssociations = useMemo(() => {
    return courses.map((c) => {
      const associatedForms = feedbackForms.filter(
        (f) => f.courseId === c.courseId || f.courseCode === c.courseCode
      );
      return {
        ...c,
        formsCount: c.formsCount ?? associatedForms.length,
        responsesCount: c.responsesCount ?? 0,
      };
    });
  }, [courses, feedbackForms]);

  const filteredCourses = useMemo(() => {
    return coursesWithAssociations.filter((c) => {
      const matchesSearch =
        (c.courseCode || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.courseName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.facultyName || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept =
        deptFilter === "All Departments" || c.department === deptFilter;

      const matchesSemester =
        semesterFilter === "All Semesters" || c.semester === semesterFilter;

      return matchesSearch && matchesDept && matchesSemester;
    });
  }, [coursesWithAssociations, searchTerm, deptFilter, semesterFilter]);

  const handleOpenAddModal = () => {
    setEditingCourseId(null);
    setErrorMessage("");
    const defaultFaculty = facultyUsers[0];
    setFormData({
      courseCode: "",
      courseName: "",
      department: "Computer Science",
      semester: "Fall 2024",
      facultyId: defaultFaculty?.facultyDetails?._id || defaultFaculty?.userId || "",
      credits: 4,
      enrolledCount: 60,
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c) => {
    setEditingCourseId(c.courseId);
    setErrorMessage("");
    setFormData({
      courseCode: c.courseCode,
      courseName: c.courseName,
      department: c.department || "Computer Science",
      semester: c.semester || "Fall 2024",
      facultyId: c.facultyIds?.[0]?._id || c.facultyIds?.[0] || "",
      credits: c.credits || 4,
      enrolledCount: c.enrolledCount || 60,
      status: c.status || "Active",
    });
    setIsModalOpen(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const code = formData.courseCode.trim().toUpperCase();
    const name = formData.courseName.trim();

    if (!code || !name) {
      setErrorMessage("Please enter both a Course Code and Course Title.");
      return;
    }

    const codeRegex = /^[A-Z]{2,5}[0-9]{3,4}$/;
    if (!codeRegex.test(code)) {
      setErrorMessage("Course Code must match pattern: 2-5 uppercase letters followed by 3-4 digits (e.g. CS101, SE401).");
      return;
    }

    setIsSaving(true);

    try {
      const selectedFaculty = facultyUsers.find(
        (f) => f.facultyDetails?._id === formData.facultyId || f.userId === formData.facultyId
      );

      const payload = {
        courseCode: code,
        courseName: name,
        department: formData.department,
        semester: formData.semester,
        facultyIds: formData.facultyId ? [formData.facultyId] : [],
        facultyName: selectedFaculty?.name || "Dr. Alan Turing",
        credits: Number(formData.credits) || 4,
        enrolledCount: Number(formData.enrolledCount) || 60,
        status: formData.status,
      };

      let result;
      if (editingCourseId) {
        result = await updateCourse(editingCourseId, payload);
      } else {
        result = await addCourse(payload);
      }

      if (result && result.success !== false) {
        setIsModalOpen(false);
      } else {
        setErrorMessage(result?.message || "Operation failed. Please verify inputs.");
      }
    } catch (err) {
      setErrorMessage(err.message || "An error occurred while saving the course.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCourse = async (course) => {
    if ((course.formsCount && course.formsCount > 0) || (course.responsesCount && course.responsesCount > 0)) {
      alert(
        `Action Blocked: Course ${course.courseCode} has ${course.formsCount} feedback form(s) and ${course.responsesCount} student submission(s). To preserve academic evaluation history, you cannot delete active courses. Please edit the course and set its status to 'Inactive' instead.`
      );
      return;
    }

    if (confirm(`Are you sure you want to permanently delete ${course.courseCode}: ${course.courseName}?`)) {
      await deleteCourse(course.courseId);
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Title & Add Course Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-800">
            Course Management
          </h1>
          <p className="mt-2 text-sm md:text-base font-medium text-slate-500">
            Authoritative registry of academic courses and their associated feedback evaluation forms
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          icon={Plus}
          onClick={handleOpenAddModal}
          className="rounded-xl font-bold py-2.5 px-5 shadow-sm"
        >
          Add Course
        </Button>
      </div>

      {/* KPI Overview Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Courses</div>
            <div className="text-2xl font-black text-slate-800">{coursesWithAssociations.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Evaluation Forms</div>
            <div className="text-2xl font-black text-slate-800">
              {coursesWithAssociations.reduce((acc, c) => acc + (c.formsCount || 0), 0)}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Enrollments</div>
            <div className="text-2xl font-black text-slate-800">
              {coursesWithAssociations.reduce((acc, c) => acc + (c.enrolledCount || 0), 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <Card className="p-5 md:p-6 rounded-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by code, title, or instructor..."
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option>All Departments</option>
              <option>Computer Science</option>
              <option>Mathematics</option>
              <option>Physics</option>
              <option>Engineering</option>
              <option>Business</option>
              <option>Arts & Humanities</option>
            </select>

            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option>All Semesters</option>
              <option>Fall 2024</option>
              <option>Spring 2024</option>
              <option>Fall 2023</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Courses Table */}
      <Card className="p-0 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-xs border-b border-slate-200">
              <tr>
                <th className="py-4 px-6">Course Code</th>
                <th className="py-4 px-6">Course Title</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6">Semester</th>
                <th className="py-4 px-6">Faculty Instructor</th>
                <th className="py-4 px-6 text-center">Associated Forms</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-14 text-center text-slate-400">
                    <BookOpen className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No courses match the current filters.</p>
                    <p className="text-xs text-slate-400 mt-1">Try switching to 'All Semesters' or clear the search input.</p>
                  </td>
                </tr>
              ) : (
                filteredCourses.map((c) => (
                  <tr key={c.courseId} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 font-extrabold text-blue-700 font-mono text-sm">
                      {c.courseCode}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">
                      <div>{c.courseName}</div>
                      <div className="text-xs text-slate-400 font-normal mt-0.5">
                        {c.credits ? `${c.credits} Credits • ` : ""}{c.enrolledCount || 60} Students Enrolled
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {c.department}
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-medium">
                      {c.semester}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                          {c.facultyName ? c.facultyName.charAt(c.facultyName.indexOf(" ") + 1 || 0) : "F"}
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                          {c.facultyName || "Dr. Alan Turing"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        (c.formsCount || 0) > 0
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}>
                        <FileText className="h-3.5 w-3.5" />
                        {c.formsCount || 0} {c.formsCount === 1 ? "Form" : "Forms"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${
                          c.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {c.status || "Active"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(c)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition"
                          title="Edit Course Information"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(c)}
                          className={`rounded-lg p-1.5 transition ${
                            (c.formsCount && c.formsCount > 0)
                              ? "text-slate-300 hover:bg-amber-50 hover:text-amber-600"
                              : "text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          }`}
                          title={(c.formsCount && c.formsCount > 0) ? "Course has linked forms (Protected)" : "Delete Course"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 px-6 py-4 text-xs sm:text-sm text-slate-500 gap-3">
          <span>
            Showing <span className="font-bold text-slate-800">{filteredCourses.length}</span> course records from database
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 mr-2">Page 1 of 1</span>
            <button disabled className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-300 cursor-not-allowed">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-xs">
              1
            </button>
            <button disabled className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-300 cursor-not-allowed">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Add / Edit Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourseId ? "Edit Course Information" : "Register New Academic Course"}
      >
        <form onSubmit={handleSaveCourse} className="space-y-4 text-sm">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Course Code *
              </label>
              <input
                type="text"
                required
                value={formData.courseCode}
                onChange={(e) => setFormData({ ...formData, courseCode: e.target.value.toUpperCase() })}
                placeholder="e.g. CS401"
                className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Pattern: CS101, MATH202, SE401</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Semester / Academic Term *
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              >
                <option>Fall 2024</option>
                <option>Spring 2024</option>
                <option>Fall 2023</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Course Title *
            </label>
            <input
              type="text"
              required
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              placeholder="e.g. Distributed Cloud Computing"
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Department *
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              >
                <option>Computer Science</option>
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Engineering</option>
                <option>Business</option>
                <option>Arts & Humanities</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Assigned Instructor *
              </label>
              <select
                value={formData.facultyId}
                onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              >
                {facultyUsers.length > 0 ? (
                  facultyUsers.map((fac) => (
                    <option key={fac.userId} value={fac.facultyDetails?._id || fac.userId}>
                      {fac.name} ({fac.department || "Faculty"})
                    </option>
                  ))
                ) : (
                  <option value="">Dr. Alan Turing (Computer Science)</option>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Credits
              </label>
              <input
                type="number"
                min={1}
                max={6}
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Enrolled Count
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={formData.enrolledCount}
                onChange={(e) => setFormData({ ...formData, enrolledCount: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Course Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : editingCourseId ? "Save Changes" : "Create Course"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CourseManagementPage;
