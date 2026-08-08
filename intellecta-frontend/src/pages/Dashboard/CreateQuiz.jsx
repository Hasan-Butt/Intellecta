import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Save, 
  Clock, 
  Layout, 
  CheckCircle2,
  HelpCircle,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import Sidebar from "../../components/dashboard/Sidebar";
import Navbar from "../../components/dashboard/Navbar";
import intellectaLogo from "../../assets/intellectaLogo.jpeg";

import quizService from "../../services/quizService";
import api from "../../services/api";
import Swal from 'sweetalert2';
import { uploadFile, validateImageFile } from '../../utils/uploadthing';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Create Quiz");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [quizData, setQuizData] = useState({
    description: "",
    category: "",
    topic: "",
    difficulty: "Beginner",
    timeLimit: 30,
    imageUrl: "https://plus.unsplash.com/premium_vector-1721296175273-327b6a8f4c42?q=80&w=580&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    questions: [
      {
        text: "",
        options: ["", "", "", ""],
        correctOptionIndex: 0
      }
    ]
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/content/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;
    const categoryName = categories.find(c => c.id.toString() === categoryId)?.name || "";
    
    setSelectedCategoryId(categoryId);
    setQuizData(prev => ({ ...prev, category: categoryName, topic: "" }));
    setTopics([]);

    if (categoryId) {
      try {
        const response = await api.get(`/content/categories/${categoryId}/topics`);
        setTopics(response.data);
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    }
  };

  const handleTopicChange = (e) => {
    const topicName = e.target.value;
    setQuizData(prev => ({ ...prev, topic: topicName }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      validateImageFile(file);
      const fileUrl = await uploadFile(file);
      setQuizData(prev => ({ ...prev, imageUrl: fileUrl }));
      Swal.fire({
        title: 'Uploaded!',
        text: 'Image successfully uploaded.',
        icon: 'success',
        confirmButtonColor: '#6C5DD3',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      Swal.fire({
        title: 'Upload Failed',
        text: `Could not upload the image: ${error.message}`,
        icon: 'error',
        confirmButtonColor: '#6C5DD3'
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleQuizChange = (e) => {
    let { name, value } = e.target;
    
    if (name === "timeLimit" && value !== "") {
      const numValue = parseInt(value, 10);
      value = isNaN(numValue) || numValue < 1 ? 1 : numValue;
    }
    
    setQuizData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...quizData.questions];
    newQuestions[index][field] = value;
    setQuizData(prev => ({ ...prev, questions: newQuestions }));
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...quizData.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuizData(prev => ({ ...prev, questions: newQuestions }));
  };

  const addQuestion = () => {
    setQuizData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        { text: "", options: ["", "", "", ""], correctOptionIndex: 0 }
      ]
    }));
  };

  const removeQuestion = (index) => {
    if (quizData.questions.length > 1) {
      const newQuestions = quizData.questions.filter((_, i) => i !== index);
      setQuizData(prev => ({ ...prev, questions: newQuestions }));
    }
  };

  const nextStep = () => {
    if (step === 1 && !quizData.imageUrl) {
      Swal.fire({
        title: 'Missing Image',
        text: 'Please provide an image URL first.',
        icon: 'error',
        confirmButtonColor: '#6C5DD3'
      });
      return;
    }
    if (step === 2) {
      const missingFields = [];
      if (!quizData.category) missingFields.push("Category");
      if (!quizData.topic) missingFields.push("Topic");
      if (!quizData.description.trim()) missingFields.push("Description");

      if (missingFields.length > 0) {
        Swal.fire({
          title: 'Incomplete Details',
          html: `Please provide the following: ${missingFields.map(f => `<b>${f}</b>`).join(', ')}.`,
          icon: 'error',
          confirmButtonColor: '#6C5DD3'
        });
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate questions
    if (!quizData.questions || quizData.questions.length === 0) {
      Swal.fire({
        title: 'No Questions',
        text: 'Please add at least one question to the quiz.',
        icon: 'error',
        confirmButtonColor: '#6C5DD3'
      });
      return;
    }

    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i];
      const missingParts = [];
      
      if (!q.text.trim()) {
        missingParts.push("Question Text");
      }
      
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          missingParts.push(`Option ${j + 1}`);
        }
      }

      if (missingParts.length > 0) {
        Swal.fire({
          title: 'Incomplete Question',
          html: `Question ${i + 1} is missing the following: ${missingParts.map(p => `<b>${p}</b>`).join(', ')}.`,
          icon: 'error',
          confirmButtonColor: '#6C5DD3'
        });
        return;
      }

      const trimmedOptions = q.options.map(opt => opt.trim());
      const uniqueOptions = new Set(trimmedOptions);
      if (uniqueOptions.size !== q.options.length) {
        Swal.fire({
          title: 'Duplicate Options',
          text: `Question ${i + 1} has duplicate options. Please ensure all 4 options are unique.`,
          icon: 'error',
          confirmButtonColor: '#6C5DD3'
        });
        return;
      }
    }

    setLoading(true);
    try {
      await quizService.createQuiz(quizData);
      await Swal.fire({
        title: 'Success!',
        text: 'Quiz created successfully!',
        icon: 'success',
        confirmButtonColor: '#6C5DD3'
      });
      navigate('/content');
    } catch (error) {
      console.error("Failed to create quiz:", error);
      Swal.fire({
        title: 'Error',
        text: 'Error creating quiz. Please try again.',
        icon: 'error',
        confirmButtonColor: '#6C5DD3'
      });
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-4 mb-12">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black text-sm transition-all ${step === s ? 'bg-[#6C5DD3] text-white shadow-lg shadow-indigo-100 scale-110' : step > s ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
            {step > s ? '✓' : s}
          </div>
          {s < 3 && <div className={`w-12 h-1 rounded-full ${step > s ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar intellectaLogo={intellectaLogo} />
      <div className="flex min-h-screen bg-[#F9FAFB] font-inter">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-10 space-y-10 overflow-x-hidden">
          <div className="max-w-[1000px] mx-auto">
            <header className="mb-10 flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black tracking-tight text-[#111827]">
                  {step === 1 ? "Visual Identity" : step === 2 ? "Quiz Details" : "Create Quiz"}
                </h2>
                <p className="text-gray-400 font-bold mt-2">
                  {step === 1 ? "Start by giving your quiz a compelling cover image." : step === 2 ? "Define the core parameters of your assessment." : "Design the questions and answers."}
                </p>
              </div>
              {step === 3 && (
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-[#6C5DD3] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-indigo-100 hover:scale-105 transition-transform disabled:opacity-50"
                >
                  <Save size={20} strokeWidth={3} /> {loading ? "Saving..." : "Publish Quiz"}
                </button>
              )}
            </header>

            <StepIndicator />

            <form className="space-y-8" onSubmit={e => e.preventDefault()}>
              {/* Step 1: Image URL */}
              {step === 1 && (
                <section className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-indigo-50 p-2 rounded-lg text-[#6C5DD3]">
                      <Layout size={20} />
                    </div>
                    <h3 className="font-black text-xl text-[#111827]">Cover Image</h3>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Thumbnail/Cover URL</label>
                    <input 
                      type="text" 
                      name="imageUrl"
                      value={quizData.imageUrl}
                      onChange={handleQuizChange}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3] outline-none transition-all font-bold text-sm"
                    />
                    
                    <div className="flex items-center gap-4 my-6">
                      <div className="h-px flex-1 bg-gray-200"></div>
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest">OR</span>
                      <div className="h-px flex-1 bg-gray-200"></div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Upload from Computer</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3] outline-none transition-all font-bold text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-[#6C5DD3] file:text-white hover:file:bg-[#5a4ebd]"
                      />
                      {uploadingImage && <p className="text-sm text-[#6C5DD3] font-bold animate-pulse mt-2 ml-1">Uploading image...</p>}
                    </div>
                    
                    {quizData.imageUrl && (
                      <div className="mt-8 rounded-[30px] overflow-hidden border-4 border-white shadow-2xl aspect-[16/9] bg-gray-100 relative group">
                        <img 
                          src={quizData.imageUrl} 
                          alt="Preview" 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=800";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                          <p className="text-white font-black text-xl">Image Preview</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-4">
                    <button 
                      type="button"
                      onClick={nextStep}
                      className="bg-[#6C5DD3] text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-indigo-100 hover:gap-5 transition-all"
                    >
                      Next Step <ArrowRight size={20} strokeWidth={3} />
                    </button>
                  </div>
                </section>
              )}

              {/* Step 2: Basic Info */}
              {step === 2 && (
                <section className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Select Category</label>
                      <select 
                        name="category"
                        value={selectedCategoryId}
                        onChange={handleCategoryChange}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3] outline-none transition-all font-bold text-sm appearance-none"
                      >
                        <option value="">Choose a Category...</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Select Topic</label>
                      <select 
                        name="topic"
                        value={quizData.topic}
                        onChange={handleTopicChange}
                        disabled={!selectedCategoryId}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3] outline-none transition-all font-bold text-sm appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">{selectedCategoryId ? "Choose a Topic..." : "Select Category First"}</option>
                        {topics.map(topic => (
                          <option key={topic.id} value={topic.name}>{topic.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Description</label>
                    <textarea 
                      name="description"
                      value={quizData.description}
                      onChange={handleQuizChange}
                      placeholder="Provide a brief overview of what this quiz covers..."
                      rows="3"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3] outline-none transition-all font-bold text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Difficulty Level</label>
                      <div className="grid grid-cols-3 gap-3">
                        {["Beginner", "Intermediate", "Expert"].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => handleQuizChange({ target: { name: 'difficulty', value: level } })}
                            className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border ${quizData.difficulty === level ? 'bg-[#6C5DD3] text-white border-[#6C5DD3] shadow-lg shadow-indigo-100' : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-white'}`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Time Limit (Minutes)</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          name="timeLimit"
                          min="1"
                          value={quizData.timeLimit}
                          onChange={handleQuizChange}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3] outline-none transition-all font-bold text-sm"
                        />
                        <Clock size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button 
                      type="button"
                      onClick={prevStep}
                      className="text-gray-400 font-bold flex items-center gap-2 hover:text-[#111827] transition-all"
                    >
                      <ArrowLeft size={20} strokeWidth={3} /> Go Back
                    </button>
                    <button 
                      type="button"
                      onClick={nextStep}
                      className="bg-[#6C5DD3] text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-indigo-100 hover:gap-5 transition-all"
                    >
                      Next Step <ArrowRight size={20} strokeWidth={3} />
                    </button>
                  </div>
                </section>
              )}

              {/* Step 3: Questions */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {quizData.questions.map((question, qIndex) => (
                    <div key={qIndex} className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6 relative group transition-all hover:shadow-md">
                      <button 
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="absolute top-8 right-8 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={20} />
                      </button>

                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="h-8 w-8 rounded-full bg-[#6C5DD3] text-white flex items-center justify-center font-black text-xs">
                            {qIndex + 1}
                          </div>
                          <input 
                            type="text" 
                            value={question.text}
                            onChange={(e) => handleQuestionChange(qIndex, "text", e.target.value)}
                            placeholder="Type your question here..."
                            className="flex-1 bg-transparent border-b-2 border-gray-50 focus:border-[#6C5DD3] outline-none py-2 text-lg font-black transition-all"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                          {question.options.map((option, oIndex) => (
                            <div 
                              key={oIndex}
                              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${question.correctOptionIndex === oIndex ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-100'}`}
                            >
                              <button
                                type="button"
                                onClick={() => handleQuestionChange(qIndex, "correctOptionIndex", oIndex)}
                                className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${question.correctOptionIndex === oIndex ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-gray-200'}`}
                              >
                                {question.correctOptionIndex === oIndex && <CheckCircle2 size={14} strokeWidth={3} />}
                              </button>
                              <input 
                                type="text" 
                                value={option}
                                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                placeholder={`Option ${oIndex + 1}`}
                                className="bg-transparent outline-none flex-1 font-bold text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  <button 
                    type="button"
                    onClick={addQuestion}
                    className="w-full border-2 border-dashed border-gray-200 rounded-[40px] py-8 flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-[#6C5DD3] hover:text-[#6C5DD3] hover:bg-[#6C5DD3]/5 transition-all group"
                  >
                    <div className="bg-gray-100 p-3 rounded-2xl group-hover:bg-[#6C5DD3] group-hover:text-white transition-all">
                      <Plus size={24} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest">Append New Question</span>
                  </button>
                  
                  <div className="flex justify-start pt-4">
                    <button 
                      type="button"
                      onClick={prevStep}
                      className="text-gray-400 font-bold flex items-center gap-2 hover:text-[#111827] transition-all"
                    >
                      <ArrowLeft size={20} strokeWidth={3} /> Go Back
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateQuiz;
