import React, { useState } from "react";
import {
  Search,
  Plus,
  BookOpen,
  Edit2,
  Trash2,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";

export function CourseManagementPage() {
  const { courses, addCourse, updateCourse, deleteCourse, users } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [semesterFilter, setSemesterFilter] = useState("Spring 2024");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [formData, setFormData] = useState({
    courseCode: "",
    courseName: "",
    department: "Computer Science",
    semester: "Spring 2024",
    facultyName: "Dr. Alan Turing",
    status: "Active"
  });

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.courseName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept =
      deptFilter === "All Departments" || c.department === deptFilter;

    const matchesSemester =
      semesterFilter === "All Semesters" || c.semester === semesterFilter;

    return matchesSearch && matchesDept && matchesSemester;
  });

  const handleOpenAddModal = () => {
    setEditingCourseId(null);
    setFormData({
      courseCode: "",
      courseName: "",
      department: "Computer Science",
      semester: "Spring 2024",
      facultyName: "Dr. Alan Turing",
      status: "Active"
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c) => {
    setEditingCourseId(c.courseId);
    setFormData({
      courseCode: c.courseCode,
      courseName: c.courseName,
      department: c.department,
      semester: c.semester,
      facultyName: c.facultyNames ? c.facultyNames[0] : "Dr. Alan Turing",
      status: c.status
    });
    setIsModalOpen(true);
  };

  const handleSaveCourse = (e) => {
    e.preventDefault();
    if (!formData.courseCode || !formData.courseName) {
      alert("Please provide both Course Code and Course Name.");
      return;
    }

    const payload = {
      ...formData,
      facultyNames: [formData.facultyName]
    };

    if (editingCourseId) {
      updateCourse(editingCourseId, payload);
    } else {
      addCourse(payload);
    }
    setIsModalOpen(false);
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
            Manage and organize all academic courses for the current semester
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

      {/* Filters */}
      <Card className="p-5 md:p-6 rounded-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by course code or name..."
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
              <option>Arts & Humanities</option>
              <option>Business</option>
              <option>Mathematics</option>
              <option>Physics</option>
            </select>

            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option>All Semesters</option>
              <option>Spring 2024</option>
              <option>Fall 2024</option>
              <option>Fall 2023</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Courses Table */}
      <Card className="p-0 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-xs border-b border-slate-200">
              <tr>
                <th className="py-4 px-6">Course Code</th>
                <th className="py-4 px-6">Course Name</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6">Semester</th>
                <th className="py-4 px-6">Faculty</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No courses match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((c) => (
                  <tr key={c.courseId} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 font-extrabold text-blue-700 font-mono">
                      {c.courseCode}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">
                      {c.courseName}
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {c.department}
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-medium">
                      {c.semester}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                          {c.facultyNames ? c.facultyNames[0].charAt(0) : "F"}
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                          {c.facultyNames ? c.facultyNames[0] : "Unassigned"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={c.status.toLowerCase()} size="md">{c.status}</Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => handleOpenEditModal(c)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition"
                          title="Edit Course"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete course ${c.courseCode}: ${c.courseName}?`)) {
                              deleteCourse(c.courseId);
                            }
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                          title="Delete Course"
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

        {/* Pagination controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 px-6 py-4 text-xs sm:text-sm text-slate-500 gap-3">
          <span>Showing 1 to {filteredCourses.length} of 87 results</span>

          <div className="flex items-center gap-1.5">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-xs">
              1
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold">
              2
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold">
              3
            </button>
            <span className="px-1.5 text-slate-400">...</span>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold">
              10
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Add / Edit Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourseId ? "Edit Course" : "Add New Academic Course"}
      >
        <form onSubmit={handleSaveCourse} className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Course Code
              </label>
              <input
                type="text"
                required
                value={formData.courseCode}
                onChange={(e) => setFormData({ ...formData, courseCode: e.target.value.toUpperCase() })}
                placeholder="e.g. CS201"
                className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Semester / Term
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option>Spring 2024</option>
                <option>Fall 2024</option>
                <option>Fall 2023</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Course Title
            </label>
            <input
              type="text"
              required
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              placeholder="e.g. Introduction to Computer Science"
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option>Computer Science</option>
                <option>Arts & Humanities</option>
                <option>Business</option>
                <option>Mathematics</option>
                <option>Physics</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Faculty Instructor
              </label>
              <input
                type="text"
                value={formData.facultyName}
                onChange={(e) => setFormData({ ...formData, facultyName: e.target.value })}
                placeholder="Dr. Alan Turing"
                className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Course Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option>Active</option>
              <option>Draft</option>
              <option>Completed</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              {editingCourseId ? "Save Changes" : "Create Course"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CourseManagementPage;
