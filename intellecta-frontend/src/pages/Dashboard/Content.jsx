import React, { useState, useEffect } from "react";
import {
  Brain,
  Database,
  Plus,
  Trash2,
  Edit2,
  Zap,
} from "lucide-react";
import Sidebar from "../../components/dashboard/Sidebar";
import Navbar from "../../components/dashboard/Navbar";
import intellectaLogo from "../../assets/intellectaLogo.jpeg";
import api from "../../services/api";

const ContentPage = () => {
  const [activeTab, setActiveTab] = useState("Content");
  const [subjects, setSubjects] = useState([]);
  const [adaptiveStats, setAdaptiveStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" or "edit"

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  // Form States
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    code: "",
    iconName: "Brain",
    bgColor: "bg-purple-50"
  });
  const [newTopicName, setNewTopicName] = useState("");

  const iconMap = {
    Brain: <Brain className="text-purple-500" />,
    Database: <Database className="text-emerald-500" />,
    Zap: <Zap className="text-emerald-500" />,
  };

  useEffect(() => {
    fetchContent();
    fetchAdaptiveStats();
  }, []);

  const fetchAdaptiveStats = async () => {
    try {
      const response = await api.get("/content/adaptive-stats");
      setAdaptiveStats(response.data);
    } catch (error) {
      console.error("Error fetching adaptive stats:", error);
    }
  };

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await api.get("/content/categories");
      setSubjects(response.data);
    } catch (error) {
      console.error("Error fetching content repository:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setCategoryForm({
      name: "",
      description: "",
      code: "",
      iconName: "Brain",
      bgColor: "bg-purple-50"
    });
    setShowCategoryModal(true);
  };

  const handleOpenEditModal = (subject) => {
    setModalMode("edit");
    setSelectedCategory(subject);
    setCategoryForm({
      name: subject.name,
      description: subject.description,
      code: subject.code,
      iconName: subject.iconName,
      bgColor: subject.bgColor
    });
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "create") {
        await api.post("/content/categories", categoryForm);
      } else {
        await api.put(`/content/categories/${selectedCategory.id}`, categoryForm);
      }
      setShowCategoryModal(false);
      fetchContent();
    } catch (error) {
      console.error("Failed to save category:", error);
    }
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !newTopicName) return;
    try {
      await api.post(`/content/categories/${selectedCategory.id}/topics`, { name: newTopicName });
      setShowTopicModal(false);
      setNewTopicName("");
      fetchContent();
    } catch (error) {
      console.error("Failed to add topic:", error);
    }
  };

  const requestDeleteCategory = (id) => {
    const category = subjects.find(s => s.id === id);
    setSelectedCategory(category);
    setConfirmAction(() => () => deleteCategory(id));
    setShowConfirmModal(true);
  };

  const deleteCategory = async (id) => {
    try {
      await api.delete(`/content/categories/${id}`);
      fetchContent();
    } catch (error) {
      console.error("Failed to delete category:", error);
    } finally {
      setShowConfirmModal(false);
    }
  };

  const requestDeleteTopic = (topicId) => {
    setConfirmAction(() => () => deleteTopic(topicId));
    setShowConfirmModal(true);
  };

  const deleteTopic = async (topicId) => {
    try {
      await api.delete(`/topics/${topicId}`);
      fetchContent();
    } catch (error) {
      console.error("Failed to delete topic:", error);
    } finally {
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar intellectaLogo={intellectaLogo} />

      <div className="flex min-h-screen bg-[#F9FAFB] font-inter">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-10 space-y-10 overflow-x-hidden">
          <div className="max-w-[1400px] mx-auto space-y-10">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-4xl font-black tracking-tight text-[#111827]">
                  Content Repository
                </h2>
                <p className="text-gray-400 font-bold mt-2">
                  Manage pedagogical categories and associated quiz structures.
                </p>
              </div>
              <button 
                onClick={handleOpenCreateModal}
                className="bg-[#6C5DD3] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-indigo-100 hover:scale-105 transition-transform"
              >
                <Plus size={20} strokeWidth={3} /> Create New Category
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                {subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-5">
                        <div className={`${subject.bgColor} p-4 rounded-2xl`}>
                          {iconMap[subject.iconName] ? React.cloneElement(iconMap[subject.iconName], { size: 28 }) : <Brain size={28} className="text-gray-400" />}
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-[#111827]">
                            {subject.name}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[#6C5DD3] font-black text-xs uppercase tracking-widest">
                              {subject.code}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                              {subject.topics?.length || 0} Total Titles
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                              {subject.quizCount || 0} Total Quizzes
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleOpenEditModal(subject)}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-xl transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => requestDeleteCategory(subject.id)}
                          className="p-2 text-red-400 hover:text-red-600 rounded-xl transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="mb-8">
                      <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-2xl">
                        {subject.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {subject.topics?.map((topic, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 bg-gray-50 p-5 rounded-[24px] border border-gray-100 hover:border-[#6C5DD3]/30 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#6C5DD3]" />
                            <span className="text-sm font-black text-[#111827]">
                              {topic.name}
                            </span>
                          </div>
                          <button 
                            onClick={() => requestDeleteTopic(topic.id)}
                            className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex mt-6">
                      <button 
                        onClick={() => {
                          setSelectedCategory(subject);
                          setShowTopicModal(true);
                        }}
                        className="w-full border-2 border-dashed border-gray-100 rounded-[24px] py-4 flex items-center justify-center gap-2 text-indigo-400 hover:bg-indigo-50/50 transition-all group"
                      >
                        <Plus
                          size={18}
                          strokeWidth={3}
                          className="group-hover:scale-110"
                        />
                        <span className="text-xs font-black uppercase tracking-widest">
                          Append New Topic
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm sticky top-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-emerald-50 p-2 rounded-lg">
                      <Zap
                        size={20}
                        className="text-emerald-500 fill-emerald-500"
                      />
                    </div>
                    <h3 className="font-black text-lg text-[#111827]">
                      Adaptive Quiz Engine
                    </h3>
                  </div>

                  <p className="text-gray-400 font-medium text-sm leading-relaxed mb-8">
                    The engine identifies knowledge gaps by analyzing failure rates (students scoring &lt; 50%).
                  </p>

                  <div className="space-y-4">
                    {adaptiveStats.length > 0 ? (
                      adaptiveStats.map((stat, idx) => (
                        <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-red-100 transition-colors">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-[#111827] uppercase tracking-wider">{stat.categoryName}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">{stat.totalAttempts} Attempts</span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-black text-red-500">{stat.failureRate}%</span>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Failure</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-xs font-bold text-gray-400 uppercase italic">No failure data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Category Modal (Create/Edit) */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-xl p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
            <div>
              <h3 className="text-3xl font-black text-[#111827]">{modalMode === "create" ? "New Category" : "Edit Category"}</h3>
              <p className="text-gray-400 font-bold mt-1 text-sm uppercase tracking-widest">
                {modalMode === "create" ? "Define a pedagogical structure" : `Updating ${selectedCategory?.name}`}
              </p>
            </div>
            
            <form onSubmit={handleCategorySubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Category Name</label>
                  <input 
                    type="text" 
                    required
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                    placeholder="e.g. Psychology"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3] font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Course Code</label>
                  <input 
                    type="text" 
                    required
                    value={categoryForm.code}
                    onChange={(e) => setCategoryForm({...categoryForm, code: e.target.value})}
                    placeholder="e.g. CS-101"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3] font-bold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Description</label>
                <textarea 
                  required
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                  rows="3"
                  placeholder="What is this category about?"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3] font-bold text-sm"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 px-8 py-4 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-[#6C5DD3] text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:scale-[1.02] transition-all"
                >
                  {modalMode === "create" ? "Create Category" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Topic Modal */}
      {showTopicModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
            <div>
              <h3 className="text-2xl font-black text-[#111827]">Add New Topic</h3>
              <p className="text-gray-400 font-bold mt-1 text-xs uppercase tracking-widest">
                Target Category: <span className="text-[#6C5DD3]">{selectedCategory?.name}</span>
              </p>
            </div>
            
            <form onSubmit={handleAddTopic} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Topic Title</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="e.g. Advanced Cognition Theory"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3] font-bold text-sm"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowTopicModal(false)}
                  className="flex-1 px-8 py-4 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-[#6C5DD3] text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:scale-[1.02] transition-all"
                >
                  Append Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Deletion Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#111827]">Are you sure?</h3>
              <p className="text-gray-400 font-medium mt-2">
                This action is permanent and will remove the selected content from the repository.
              </p>
            </div>
            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-8 py-4 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmAction}
                className="flex-1 bg-red-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-red-100 hover:bg-red-600 transition-all"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentPage;