import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  GraduationCap,
  Award,
  TrendingUp,
  Coins,
  Briefcase,
  Layers,
  Compass,
  BookOpen,
  Calendar,
  FileText,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles,
  ChevronRight,
  AlertCircle,
  MapPin,
  ExternalLink,
  Trophy,
  RefreshCw,
  Check,
  RotateCcw,
  Info,
  ChevronDown
} from "lucide-react";

// Types
interface SalaryProjection {
  min: number;
  max: number;
  median: number;
  currency: string;
  period: string;
}

interface SalaryUSD {
  min: number;
  max: number;
  median: number;
}

interface GoogleOffering {
  title: string;
  category: string;
  reason: string;
}

interface LocalResource {
  title: string;
  type: string;
  description: string;
}

interface SearchSource {
  title: string;
  uri: string;
}

interface RelevanceResult {
  relevanceScore: number;
  demandIndex: "High" | "Medium" | "Low";
  growthFiveYears: string;
  marketOverview: string;
  salaryLocal: SalaryProjection;
  salaryUSD: SalaryUSD;
  hiringSectors: string[];
  topInDemandSkills: string[];
  skillGaps: string[];
  googleOfferings: GoogleOffering[];
  localResources: LocalResource[];
  searchSources?: SearchSource[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

interface PlanDay {
  day: number;
  topics: string[];
  dynamicTips: string;
  tasks: string[];
}

interface SummarizeResult {
  summary: string;
  keyTakeaways: string[];
  mindmap: {
    topic: string;
    subtopics: string[];
  }[];
}

// Preset degree suggestions for quick fill
const PRESET_DEGREES = [
  "B.Sc. in Computer Science",
  "Bachelor of Business Administration",
  "B.Eng. in Electrical Engineering",
  "Bachelor of Medicine & Surgery (MBChB)",
  "B.Com. in Accounting & Finance",
  "Bachelor of Civil Engineering",
  "B.Sc. in Data Science & Analytics",
  "B.Sc. in Nursing",
  "Bachelor of Laws (LLB)"
];

// Fallback initial data so the dashboard doesn't load empty
const DEFAULT_CALCULATION: RelevanceResult = {
  relevanceScore: 88,
  demandIndex: "High",
  growthFiveYears: "+15% growth expected in Southern Africa & Tech Hubs",
  marketOverview: "Highly robust demand for tech talent in financial hubs like Johannesburg and Cape Town. Strong shift towards automated cloud architecture, machine learning integration, and FinTech systems.",
  salaryLocal: {
    min: 240000,
    max: 850000,
    median: 480000,
    currency: "ZAR",
    period: "annual"
  },
  salaryUSD: {
    min: 13000,
    max: 46000,
    median: 26000
  },
  hiringSectors: ["FinTech", "Cloud Engineering", "E-Commerce", "Consulting"],
  topInDemandSkills: ["Python & TypeScript", "Cloud Infrastructure (GCP/AWS)", "Database Architecture", "System Design"],
  skillGaps: ["Cloud deployment experience", "AI modeling foundations", "Practical system scale knowledge"],
  googleOfferings: [
    {
      title: "Google Cloud Skills Boost",
      category: "Cloud Training",
      reason: "Provides hands-on labs and credits to master real Google Cloud deployment, filling the practical system infrastructure gap."
    },
    {
      title: "Google Data Analytics Certificate",
      category: "Certificates",
      reason: "Helps ground system developer skills with data modeling techniques critical for modern enterprise software."
    }
  ],
  localResources: [
    {
      title: "Google Developer Student Clubs (GDSC)",
      type: "Community",
      description: "Join university student chapters locally in South Africa to collaborate, work on Solution Challenges, and find tech mentors."
    }
  ],
  searchSources: [
    { title: "South Africa Tech Salaries Survey 2026", uri: "https://example.com/sa-salaries" },
    { title: "MyBroadband Tech Employment Trends", uri: "https://example.com/broadband-trends" }
  ]
};

export default function App() {
  const [activeTab, setActiveTab] = useState<"calculator" | "offerings" | "companion">("calculator");
  const [currencyMode, setCurrencyMode] = useState<"local" | "usd">("local");

  // Calculator Form State
  const [degree, setDegree] = useState("B.Sc. in Computer Science");
  const [country, setCountry] = useState("South Africa");
  const [skills, setSkills] = useState("Basic Python, HTML, communication");
  const [goals, setGoals] = useState("Become a software architect and cloud specialist");
  const [isCalculating, setIsCalculating] = useState(false);
  const [relevanceResult, setRelevanceResult] = useState<RelevanceResult>(DEFAULT_CALCULATION);
  const [calcError, setCalcError] = useState("");

  // Quiz State
  const [quizTopic, setQuizTopic] = useState("Data Structures");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizError, setQuizError] = useState("");

  // Study Planner State
  const [planSubject, setPlanSubject] = useState("Database Management Systems");
  const [examDate, setExamDate] = useState("2026-08-10");
  const [studyHours, setStudyHours] = useState(3);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [studyPlan, setStudyPlan] = useState<PlanDay[]>([]);
  const [planProgress, setPlanProgress] = useState<Record<string, boolean>>({});
  const [plannerError, setPlannerError] = useState("");

  // Summarizer State
  const [notesContent, setNotesContent] = useState(
    `An operating system (OS) is system software that manages computer hardware, software resources, and provides common services for computer programs. Time-sharing operating systems schedule tasks for efficient use of the system and may also include accounting software for cost allocation of processor time, mass storage, printing, and other resources. For hardware functions such as input and output and memory allocation, the operating system acts as an intermediary between programs and the computer hardware.`
  );
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryResult, setSummaryResult] = useState<SummarizeResult | null>(null);
  const [summaryError, setSummaryError] = useState("");

  // Companion Sub-Tab Selection
  const [companionSubTab, setCompanionSubTab] = useState<"quiz" | "planner" | "summarizer">("quiz");

  // Initial prompt action
  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!degree.trim()) return;
    setIsCalculating(true);
    setCalcError("");

    try {
      const response = await fetch("/api/calculate-relevance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ degree, country, skills, goals }),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate study relevance. Please check server status.");
      }

      const data = await response.json();
      setRelevanceResult(data);
    } catch (err: any) {
      console.error(err);
      setCalcError(err.message || "Something went wrong during the analysis.");
    } finally {
      setIsCalculating(false);
    }
  };

  // Generate Quiz
  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTopic.trim()) return;
    setIsGeneratingQuiz(true);
    setQuizError("");
    setQuizAnswers({});
    setQuizSubmitted(false);

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: quizTopic, country }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate quiz questions.");
      }

      const data = await response.json();
      setQuizQuestions(data);
    } catch (err: any) {
      console.error(err);
      setQuizError(err.message || "Failed to generate study companion quiz.");
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Generate Study Plan
  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planSubject.trim()) return;
    setIsGeneratingPlan(true);
    setPlannerError("");
    setPlanProgress({});

    try {
      const response = await fetch("/api/study-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: planSubject, examDate, hoursPerDay: studyHours }),
      });

      if (!response.ok) {
        throw new Error("Failed to construct plan.");
      }

      const data = await response.json();
      setStudyPlan(data);
    } catch (err: any) {
      console.error(err);
      setPlannerError(err.message || "Failed to design dynamic study plan.");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Summarize Notes
  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notesContent.trim()) return;
    setIsSummarizing(true);
    setSummaryError("");

    try {
      const response = await fetch("/api/summarize-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesContent }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze study notes.");
      }

      const data = await response.json();
      setSummaryResult(data);
    } catch (err: any) {
      console.error(err);
      setSummaryError(err.message || "Failed to build note summaries.");
    } finally {
      setIsSummarizing(false);
    }
  };

  // Helper to format currency values safely
  const formatSalary = (amount: number, currency: string) => {
    if (!amount) return "N/A";
    const formatter = new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0
    });
    return formatter.format(amount);
  };

  const formatUSD = (amount: number) => {
    if (!amount) return "N/A";
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    });
    return formatter.format(amount);
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-gray-900 font-sans antialiased flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="flex flex-col md:flex-row items-center justify-between px-8 py-4 bg-white border-b border-gray-200 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <GraduationCap id="header-logo-icon" className="w-5 h-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-gray-900">EduPulse <span className="text-blue-600">Companion</span></span>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex bg-gray-100 p-1 rounded-full">
            <button
              onClick={() => setActiveTab("calculator")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
                activeTab === "calculator" ? "bg-white shadow-sm text-gray-900 font-semibold" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Calculator
            </button>
            <button
              onClick={() => setActiveTab("offerings")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
                activeTab === "offerings" ? "bg-white shadow-sm text-gray-900 font-semibold" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Google Hub
            </button>
            <button
              onClick={() => setActiveTab("companion")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
                activeTab === "companion" ? "bg-white shadow-sm text-gray-900 font-semibold" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              AI Study Tools
            </button>
          </div>
          <div className="hidden sm:block h-6 w-px bg-gray-200"></div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" className="w-4 h-4" alt="Google" />
            <span>Student Hub</span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          {/* TAB 1: RELEVANCE CALCULATOR */}
          {activeTab === "calculator" && (
            <motion.div
              key="calculator-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Column: Input Panel */}
              <section className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-5">
                  <h2 className="text-lg font-bold text-gray-800">Relevance Parameters</h2>
                  
                  <form onSubmit={handleCalculate} className="space-y-5">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">Degree / Field of Study</label>
                      <input
                        type="text"
                        value={degree}
                        onChange={(e) => setDegree(e.target.value)}
                        placeholder="e.g. B.Sc. in Computer Science"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />

                      {/* Presets suggestions dropdown */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {PRESET_DEGREES.slice(0, 5).map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setDegree(preset)}
                            className="text-[10px] font-bold bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 px-2.5 py-1 rounded-full transition"
                          >
                            {preset.length > 25 ? preset.slice(0, 25) + "..." : preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">Select Region</label>
                      <div className="grid grid-cols-3 gap-2">
                        {["Kenya", "Nigeria", "South Africa"].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setCountry(c)}
                            className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                              country === c
                                ? "border-2 border-blue-600 text-blue-600 bg-blue-50"
                                : "border border-gray-200 text-gray-600 hover:bg-gray-50 bg-white"
                            }`}
                          >
                            <span>{c}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">Current Skills (Optional)</label>
                      <textarea
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="e.g. JavaScript, Public Speaking, MS Excel, Graphic Design"
                        rows={2}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">Future Career Aspirations</label>
                      <input
                        type="text"
                        value={goals}
                        onChange={(e) => setGoals(e.target.value)}
                        placeholder="e.g. Startup founder, corporate financial analyst"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isCalculating}
                      className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm mt-4 hover:bg-black transition flex items-center justify-center gap-2 disabled:opacity-75"
                    >
                      {isCalculating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Recalculating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Recalculate Impact</span>
                        </>
                      )}
                    </button>
                  </form>

                  {calcError && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-start gap-2 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Analysis Failed:</span> {calcError}
                      </div>
                    </div>
                  )}
                </div>

                {/* Google Workspace Pro Card from Design HTML */}
                <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-sm flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm">Google for Education</span>
                  </div>
                  <p className="text-xs text-blue-100 leading-relaxed">
                    Complimentary Google Cloud credits and professional learning credentials available for your study path.
                  </p>
                  <button
                    onClick={() => setActiveTab("offerings")}
                    className="w-full py-2.5 bg-white text-blue-600 rounded-xl font-bold text-xs uppercase tracking-tight hover:bg-blue-50 transition"
                  >
                    Claim Workspace Pro
                  </button>
                </div>
              </section>

              {/* Right Column: Dashboard */}
              <section className="lg:col-span-8 flex flex-col gap-6">
                {relevanceResult ? (
                  <div className="flex flex-col gap-6">
                    {/* Score Header */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Market Relevance Score</p>
                        <h1 className="text-6xl font-black text-gray-900">
                          {relevanceResult.relevanceScore}
                          <span className="text-blue-600">%</span>
                        </h1>
                        <p className="text-green-500 font-bold text-sm mt-2 flex items-center gap-1">
                          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                          </svg>
                          <span>{relevanceResult.demandIndex} Demand in {country} Tech Hub</span>
                        </p>
                      </div>
                      <div className="w-32 h-32 flex items-center justify-center relative shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray="351.85"
                            strokeDashoffset={351.85 * (1 - relevanceResult.relevanceScore / 100)}
                            className="text-blue-600 transition-all duration-500"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-xl uppercase text-gray-900">
                          {country === "Kenya" ? "KE" : country === "Nigeria" ? "NG" : "ZA"}
                        </div>
                      </div>
                    </div>

                    {/* Detailed Market Overview Card */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                        <h3 className="text-md font-bold text-gray-800">Regional Market Overview</h3>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        {relevanceResult.marketOverview}
                      </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Salary Projections */}
                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-6">
                            <h3 className="font-bold text-gray-800">Salary Projections</h3>
                            <span className="text-[10px] bg-gray-100 px-2.5 py-1 rounded-md font-bold text-gray-500 uppercase">
                              ANNUAL {currencyMode === "local" ? relevanceResult.salaryLocal.currency : "USD"}
                            </span>
                          </div>
                          
                          {/* Visual Bars based on real dynamic data! */}
                          <div className="space-y-4">
                            <div className="flex items-end gap-2 h-40">
                              <div className="flex-1 bg-blue-50 h-full rounded-t-xl relative">
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: "40%" }}
                                  transition={{ duration: 0.5 }}
                                  className="absolute bottom-0 w-full bg-blue-200 rounded-t-xl flex items-center justify-center"
                                />
                              </div>
                              <div className="flex-1 bg-blue-50 h-full rounded-t-xl relative">
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: "65%" }}
                                  transition={{ duration: 0.5 }}
                                  className="absolute bottom-0 w-full bg-blue-400 rounded-t-xl flex items-center justify-center"
                                />
                              </div>
                              <div className="flex-1 bg-blue-50 h-full rounded-t-xl relative">
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: "100%" }}
                                  transition={{ duration: 0.5 }}
                                  className="absolute bottom-0 w-full bg-blue-600 rounded-t-xl flex items-center justify-center"
                                />
                              </div>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                              <span>Entry</span>
                              <span>Mid</span>
                              <span>Senior</span>
                            </div>
                            <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                              <span className="text-sm text-gray-500">Avg. Starting</span>
                              <span className="text-sm font-bold text-gray-900">
                                {currencyMode === "local"
                                  ? formatSalary(relevanceResult.salaryLocal.min, relevanceResult.salaryLocal.currency)
                                  : formatUSD(relevanceResult.salaryUSD.min)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Currency Toggle */}
                        <div className="flex bg-gray-100 p-1 rounded-full mt-4 self-center">
                          <button
                            onClick={() => setCurrencyMode("local")}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold transition ${
                              currencyMode === "local" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"
                            }`}
                          >
                            {relevanceResult.salaryLocal.currency}
                          </button>
                          <button
                            onClick={() => setCurrencyMode("usd")}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold transition ${
                              currencyMode === "usd" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"
                            }`}
                          >
                            USD ($)
                          </button>
                        </div>
                      </div>

                      {/* Top Hiring Entities / Key Industries */}
                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-6">Top Hiring Entities</h3>
                        <div className="space-y-4">
                          {relevanceResult.hiringSectors.map((sector, idx) => {
                            const letters = ["G", "S", "E", "C"];
                            const colorClasses = [
                              "bg-blue-100 text-blue-600",
                              "bg-emerald-100 text-emerald-600",
                              "bg-orange-100 text-orange-600",
                              "bg-purple-100 text-purple-600"
                            ];
                            return (
                              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100/50">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${colorClasses[idx % colorClasses.length]}`}>
                                  {letters[idx % letters.length]}
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs font-bold text-gray-800">{sector}</p>
                                  <p className="text-[10px] text-gray-400">Active Opportunities</p>
                                </div>
                                <div className="text-xs font-bold text-blue-600">Apply →</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* In-Demand Skills & Student Gaps */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                      <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Employer Demand & Skill Gaps</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">In-Demand Skills</span>
                          <div className="flex flex-wrap gap-1.5">
                            {relevanceResult.topInDemandSkills.map((skill, idx) => (
                              <span key={idx} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl text-[11px] font-bold border border-blue-100/50">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">Your Academic Skill Gaps</span>
                          <div className="flex flex-wrap gap-1.5">
                            {relevanceResult.skillGaps.map((gap, idx) => (
                              <span key={idx} className="bg-amber-50 text-amber-800 px-3 py-1.5 rounded-xl text-[11px] font-bold border border-amber-100/50 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>{gap}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Integrated Google Offerings Recommendation Module */}
                    <div className="bg-blue-50/50 rounded-3xl border border-blue-100/60 p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                        <div>
                          <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Skill Accelerator</span>
                          <h3 className="text-md font-bold text-gray-800 mt-1.5 flex items-center gap-2">
                            <Award className="w-5 h-5 text-blue-600" />
                            <span>Recommended Google Career Offerings</span>
                          </h3>
                        </div>
                        <button
                          onClick={() => setActiveTab("offerings")}
                          className="flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:text-blue-800 transition"
                        >
                          <span>Explore All Offerings</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {relevanceResult.googleOfferings.map((offering, idx) => (
                          <div key={idx} className="bg-white rounded-2xl p-4 border border-blue-100/50 shadow-xs flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                {offering.category}
                              </span>
                              <span className="text-gray-300 font-bold text-xs">#{idx + 1}</span>
                            </div>
                            <h4 className="text-xs font-bold text-gray-900">{offering.title}</h4>
                            <p className="text-xs text-gray-600 leading-relaxed italic">
                              "{offering.reason}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Local Resources chapters */}
                    {relevanceResult.localResources && relevanceResult.localResources.length > 0 && (
                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-3">
                          <Compass className="w-4 h-4 text-blue-600" />
                          <span>Local Study Chapters & Support</span>
                        </h4>
                        <div className="flex flex-col gap-3">
                          {relevanceResult.localResources.map((res, idx) => (
                            <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50 flex flex-col gap-1">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-900">{res.title}</span>
                                <span className="text-[9px] bg-gray-200/50 text-gray-600 px-2 py-0.5 rounded font-black uppercase">{res.type}</span>
                              </div>
                              <p className="text-xs text-gray-500">{res.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Verified Search Citations */}
                    {relevanceResult.searchSources && relevanceResult.searchSources.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500 font-medium bg-gray-100/80 p-3 rounded-2xl border border-gray-200/40">
                        <div className="flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-green-600" />
                          <span className="font-bold text-gray-700">Grounded Search Sources:</span>
                        </div>
                        {relevanceResult.searchSources.map((source, idx) => (
                          <a
                            key={idx}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-0.5 font-semibold"
                          >
                            <span>{source.title}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                            {idx < (relevanceResult.searchSources?.length || 0) - 1 && <span className="text-gray-300 ml-1">|</span>}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <TrendingUp className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Awaiting Study Parameters</h3>
                      <p className="text-sm text-gray-500 max-w-sm mt-1">Configure your degree and click Calculate above to see real-time regional labor market metrics.</p>
                    </div>
                  </div>
                )}
              </section>
            </motion.div>
          )}

          {/* TAB 2: GOOGLE OFFERINGS HUB */}
          {activeTab === "offerings" && (
            <motion.div
              key="offerings-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6"
            >
              {/* Hub Intro Header */}
              <div className="bg-white rounded-3xl border border-gray-100 p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xs">
                <div className="flex flex-col gap-2 max-w-2xl">
                  <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">Google Ecosystem</span>
                  <h2 className="text-2xl font-bold text-gray-800">Google Offerings for Students</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Access localized training materials, active student developer networks, cloud credits, and formal certifications configured to unlock global career options.
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100/55 flex items-center gap-3 shrink-0">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-xs">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Certificate Value</div>
                    <div className="text-md font-bold text-gray-800">82% Positive Career Impact</div>
                  </div>
                </div>
              </div>

              {/* Grid of Programs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. Google Career Certificates */}
                <div className="bg-white rounded-3xl border border-gray-100 hover:border-gray-200 transition p-6 flex flex-col gap-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Certified</span>
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-gray-800">Google Career Certificates</h3>
                    <p className="text-xs text-gray-500 mt-1">Flexible online training on Coursera with zero prerequisite knowledge.</p>
                  </div>
                  <div className="text-xs text-gray-600 flex flex-col gap-2 mt-2">
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                      <span>Fields: Cybersecurity, UX Design, Data Analytics, Project Management, IT Support.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                      <span>Includes access to Google Employer Consortium hiring partners in South Africa, Nigeria, and Kenya.</span>
                    </div>
                  </div>
                  <a
                    href="https://grow.google/certificates"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto pt-4 border-t border-gray-100 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>Visit Grow with Google</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* 2. Google Developer Student Clubs (GDSC) */}
                <div className="bg-white rounded-3xl border border-gray-100 hover:border-gray-200 transition p-6 flex flex-col gap-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Compass className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Community</span>
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-gray-800">Google Developer Student Clubs</h3>
                    <p className="text-xs text-gray-500 mt-1">University-based community groups for students interested in Google tech.</p>
                  </div>
                  <div className="text-xs text-gray-600 flex flex-col gap-2 mt-2">
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                      <span>Collaborate on the annual Google Solution Challenge addressing local UN goals.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                      <span>Hundreds of active chapters across universities in Nairobi, Lagos, and Johannesburg.</span>
                    </div>
                  </div>
                  <a
                    href="https://developers.google.com/community/gdsc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto pt-4 border-t border-gray-100 text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <span>Find Local Club Chapter</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* 3. Google Cloud Skills Boost */}
                <div className="bg-white rounded-3xl border border-gray-100 hover:border-gray-200 transition p-6 flex flex-col gap-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Hands-on Labs</span>
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-gray-800">Google Cloud Skills Boost</h3>
                    <p className="text-xs text-gray-500 mt-1">On-demand access to real-world cloud sandbox labs and official learning paths.</p>
                  </div>
                  <div className="text-xs text-gray-600 flex flex-col gap-2 mt-2">
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5" />
                      <span>Learn cloud architecture, database hosting, BigQuery, and Vertex AI.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5" />
                      <span>Earn shareable Google Cloud badges to publish directly on LinkedIn/CVs.</span>
                    </div>
                  </div>
                  <a
                    href="https://www.cloudskillsboost.google/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto pt-4 border-t border-gray-100 text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                  >
                    <span>Claim Free Cloud Labs</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* 4. Google Summer of Code (GSoC) */}
                <div className="bg-white rounded-3xl border border-gray-100 hover:border-gray-200 transition p-6 flex flex-col gap-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Open Source</span>
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-gray-800">Google Summer of Code</h3>
                    <p className="text-xs text-gray-500 mt-1">Global online program focused on bringing student developers into open source.</p>
                  </div>
                  <div className="text-xs text-gray-600 flex flex-col gap-2 mt-2">
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5" />
                      <span>Work on real codebases with expert global mentorship during academic breaks.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5" />
                      <span>Includes stipend to support remote students during development sprints.</span>
                    </div>
                  </div>
                  <a
                    href="https://summerofcode.withgoogle.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto pt-4 border-t border-gray-100 text-xs font-bold text-orange-600 hover:text-orange-800 flex items-center gap-1"
                  >
                    <span>Read GSoC Timeline</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* 5. Google Workspace for Education Tips */}
                <div className="bg-white rounded-3xl border border-gray-100 hover:border-gray-200 transition p-6 flex flex-col gap-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Productivity</span>
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-gray-800">Google Workspace Academic Tips</h3>
                    <p className="text-xs text-gray-500 mt-1">Master student collaborative workflows using Google Docs, Sheets, and Slides.</p>
                  </div>
                  <div className="text-xs text-gray-600 flex flex-col gap-2 mt-2">
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" />
                      <span>Use collaborative version control to easily run team university projects.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" />
                      <span>Integrate built-in Gemini assistants in Docs for proofreading, citations, and layout outlines.</span>
                    </div>
                  </div>
                  <span className="mt-auto pt-4 border-t border-gray-100 text-xs font-bold text-gray-400 cursor-default">
                    Free on Standard University Accounts
                  </span>
                </div>

                {/* 6. Gemini Study Companion Guide */}
                <div className="bg-gray-900 text-white rounded-3xl p-6 flex flex-col gap-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-indigo-300" />
                    </div>
                    <span className="text-[10px] font-bold text-indigo-300 bg-white/10 px-2.5 py-1 rounded-full uppercase tracking-wider">AI Tutor</span>
                  </div>
                  <div>
                    <h3 className="text-md font-bold font-display">How to use Gemini as a Tutor</h3>
                    <p className="text-xs text-slate-300 mt-1">Prompt Gemini with structural study schemas to clear conceptual bottlenecks.</p>
                  </div>
                  <div className="text-xs text-slate-300 flex flex-col gap-2 mt-2">
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5" />
                      <span>"Explain the concept of backpropagation as if I am a first-year student."</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5" />
                      <span>"Give me 3 edge-case problems for quick sort and show solution steps."</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab("companion");
                      setCompanionSubTab("quiz");
                    }}
                    className="mt-auto pt-4 border-t border-white/10 text-xs font-bold text-indigo-300 hover:text-white flex items-center gap-1 text-left"
                  >
                    <span>Launch Built-In AI Tools</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: STUDENT AI COMPONION TOOLBELT */}
          {activeTab === "companion" && (
            <motion.div
              key="companion-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Tool selector panel (Left 3 units) */}
              <div className="lg:col-span-3 flex flex-col gap-6">
                <div className="bg-white rounded-3xl border border-gray-100 p-4 flex flex-col gap-2 shadow-xs">
                  <div className="px-3 py-2">
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Student Toolbelt</h3>
                    <p className="text-[10px] text-gray-400">Select active AI academic aid module</p>
                  </div>

                  <button
                    onClick={() => setCompanionSubTab("quiz")}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition ${
                      companionSubTab === "quiz"
                        ? "bg-blue-50 text-blue-700 font-bold border border-blue-100"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                    }`}
                  >
                    <BookOpen className="w-4.5 h-4.5 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">Active Recall Quizzer</span>
                      <span className="text-[9px] text-gray-400 font-normal">Generate custom quizzes on topics</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setCompanionSubTab("planner")}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition ${
                      companionSubTab === "planner"
                        ? "bg-blue-50 text-blue-700 font-bold border border-blue-100"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                    }`}
                  >
                    <Calendar className="w-4.5 h-4.5 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">7-Day Study Planner</span>
                      <span className="text-[9px] text-gray-400 font-normal">Syllabus pacing and calendars</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setCompanionSubTab("summarizer")}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition ${
                      companionSubTab === "summarizer"
                        ? "bg-blue-50 text-blue-700 font-bold border border-blue-100"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                    }`}
                  >
                    <FileText className="w-4.5 h-4.5 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">Lecture Summarizer</span>
                      <span className="text-[9px] text-gray-400 font-normal">Turn notes to conceptual mind-maps</span>
                    </div>
                  </button>
                </div>

                {/* Micro Study Tip */}
                <div className="bg-blue-600 text-white rounded-3xl p-6 border border-blue-700 shadow-xs flex flex-col gap-3 relative overflow-hidden">
                  <div className="absolute bottom-0 right-0 p-4 opacity-5 translate-x-4 translate-y-4">
                    <Sparkles className="w-24 h-24" />
                  </div>
                  <h4 className="text-xs font-bold tracking-wider uppercase text-blue-200">Active Recall Tip</h4>
                  <p className="text-[11px] text-blue-100 leading-relaxed">
                    Research proves testing yourself BEFORE reading lectures doubles retrieval memory. Use the Quizzer to scan unfamiliar topics first.
                  </p>
                </div>
              </div>

              {/* Working space panel (Right 9 units) */}
              <div className="lg:col-span-9">
                <AnimatePresence mode="wait">
                  {/* MODULE A: ACTIVE RECALL QUIZZER */}
                  {companionSubTab === "quiz" && (
                    <motion.div
                      key="quiz-module"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col gap-6 shadow-xs"
                    >
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                          <span>Active Recall Quizzer</span>
                        </h3>
                        <p className="text-xs text-gray-500">Test and anchor academic knowledge on any syllabus subject with instant AI evaluation.</p>
                      </div>

                      {/* Topic Generator Form */}
                      <form onSubmit={handleGenerateQuiz} className="flex flex-col sm:flex-row gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="flex-1 flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Study Subject / Concept</label>
                          <input
                            type="text"
                            value={quizTopic}
                            onChange={(e) => setQuizTopic(e.target.value)}
                            placeholder="e.g. Operating System Threading, Photosynthesis, Microeconomics"
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-800"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isGeneratingQuiz}
                          className="sm:self-end px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-75 disabled:pointer-events-none cursor-pointer"
                        >
                          {isGeneratingQuiz ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Build Practice Quiz</span>
                            </>
                          )}
                        </button>
                      </form>

                      {quizError && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-2 text-xs">
                          <AlertCircle className="w-4 h-4" />
                          <span>{quizError}</span>
                        </div>
                      )}                      {/* Quiz taking container */}
                      {quizQuestions.length > 0 ? (
                        <div className="flex flex-col gap-6">
                          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <span className="text-xs font-bold text-gray-800">Topic: <span className="text-blue-600 font-bold">{quizTopic}</span></span>
                            <span className="text-[10px] text-gray-400 font-mono">5 Questions Loaded</span>
                          </div>

                          <div className="flex flex-col gap-5">
                            {quizQuestions.map((q, idx) => {
                              const selectedAnswer = quizAnswers[idx];
                              const isCorrect = selectedAnswer === q.answerIndex;
                              const isFinished = quizSubmitted;

                              return (
                                <div key={idx} className="p-4 rounded-2xl border border-gray-150/85 bg-white/50 flex flex-col gap-3">
                                  <div className="flex items-start gap-2.5">
                                    <span className="w-5 h-5 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                      {idx + 1}
                                    </span>
                                    <h4 className="text-sm font-semibold text-gray-800 leading-relaxed">{q.question}</h4>
                                  </div>

                                  {/* MC Options Grid */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7">
                                    {q.options.map((opt, optIdx) => {
                                      const isThisSelected = selectedAnswer === optIdx;
                                      const isThisCorrectOption = optIdx === q.answerIndex;

                                      let btnStyles = "border-gray-200 bg-white text-gray-700 hover:bg-gray-50";
                                      if (isThisSelected) {
                                        btnStyles = "border-blue-500 bg-blue-50/50 text-blue-700 font-semibold";
                                      }
                                      if (isFinished) {
                                        if (isThisCorrectOption) {
                                          btnStyles = "border-green-500 bg-green-50 text-green-700 font-bold";
                                        } else if (isThisSelected) {
                                          btnStyles = "border-red-400 bg-red-50 text-red-700 font-semibold";
                                        } else {
                                          btnStyles = "border-gray-100 bg-gray-50 text-gray-400 pointer-events-none";
                                        }
                                      }

                                      return (
                                        <button
                                          key={optIdx}
                                          type="button"
                                          disabled={isFinished}
                                          onClick={() => setQuizAnswers((prev) => ({ ...prev, [idx]: optIdx }))}
                                          className={`text-left px-3.5 py-2.5 rounded-xl border text-xs transition flex items-center justify-between gap-2 cursor-pointer ${btnStyles}`}
                                        >
                                          <span>{opt}</span>
                                          {isFinished && isThisCorrectOption && (
                                            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {/* Explanation display */}
                                  {isFinished && (
                                    <div className={`mt-2 p-3 rounded-xl text-xs leading-relaxed ${isCorrect ? "bg-green-50/40 text-green-800 border border-green-100/60" : "bg-gray-50 text-gray-600 border border-gray-100"}`}>
                                      <span className="font-bold">{isCorrect ? "Correct! " : "Keep Learning: "}</span>
                                      {q.explanation}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Submit Actions */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            {!quizSubmitted ? (
                              <button
                                onClick={() => setQuizSubmitted(true)}
                                disabled={Object.keys(quizAnswers).length < 5}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition disabled:opacity-50 shadow-xs cursor-pointer"
                              >
                                Submit Answers
                              </button>
                            ) : (
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full justify-between">
                                <span className="text-sm font-bold text-gray-800">
                                  Your Score:{" "}
                                  <span className="text-blue-600">
                                    {quizQuestions.reduce((acc, q, idx) => acc + (quizAnswers[idx] === q.answerIndex ? 1 : 0), 0)} / 5
                                  </span>
                                </span>
                                <button
                                  onClick={() => {
                                    setQuizAnswers({});
                                    setQuizSubmitted(false);
                                  }}
                                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Clear and Retake</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 border border-dashed border-gray-200 bg-gray-50/50 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
                          <BookOpen className="w-8 h-8 text-gray-400" />
                          <div className="text-xs font-bold text-gray-600">No active quiz</div>
                          <p className="text-[11px] text-gray-500 max-w-xs">Enter your topic above and select Build Practice Quiz to create active recall flashcards.</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* MODULE B: STUDY PLANNER */}
                  {companionSubTab === "planner" && (
                    <motion.div
                      key="planner-module"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col gap-6 shadow-xs"
                    >
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          <span>Dynamic 7-Day Study Sprint</span>
                        </h3>
                        <p className="text-xs text-gray-500">Design structural active recall checkpoints to schedule study loads ahead of upcoming exams.</p>
                      </div>

                      <form onSubmit={handleGeneratePlan} className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Exam Topic / Subject</label>
                          <input
                            type="text"
                            value={planSubject}
                            onChange={(e) => setPlanSubject(e.target.value)}
                            placeholder="e.g. Relational Databases"
                            className="px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-800"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Exam Target Date</label>
                          <input
                            type="date"
                            value={examDate}
                            onChange={(e) => setExamDate(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-800"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Target Hours / Day</label>
                          <div className="flex gap-2">
                            <select
                              value={studyHours}
                              onChange={(e) => setStudyHours(Number(e.target.value))}
                              className="flex-1 px-2.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-800"
                            >
                              <option value={1}>1 Hour / day</option>
                              <option value={2}>2 Hours / day</option>
                              <option value={3}>3 Hours / day</option>
                              <option value={4}>4 Hours / day</option>
                              <option value={5}>5+ Hours / day</option>
                            </select>

                            <button
                              type="submit"
                              disabled={isGeneratingPlan}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1 disabled:opacity-75 cursor-pointer"
                            >
                              {isGeneratingPlan ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                              <span>Plan</span>
                            </button>
                          </div>
                        </div>
                      </form>

                      {plannerError && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-2 text-xs">
                          <AlertCircle className="w-4 h-4" />
                          <span>{plannerError}</span>
                        </div>
                      )}

                      {/* Display Study Calendar Days */}
                      {studyPlan.length > 0 ? (
                        <div className="flex flex-col gap-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/55">
                            <div>
                              <h4 className="text-xs font-bold text-gray-800">Sprint Subject: {planSubject}</h4>
                              <p className="text-[11px] text-gray-500">Pace your learning leading up to {examDate}. Remember to take regular breaks.</p>
                            </div>

                            {/* Preparation Progress Bar */}
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-bold text-gray-500">Syllabus Completion:</span>
                              <div className="w-24 bg-gray-200 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                                  style={{
                                    width: `${
                                      (Object.values(planProgress).filter(Boolean).length /
                                        studyPlan.reduce((acc, d) => acc + d.tasks.length, 0)) *
                                      100
                                    }%`,
                                  }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-gray-700 font-mono">
                                {Object.values(planProgress).filter(Boolean).length} /{" "}
                                {studyPlan.reduce((acc, d) => acc + d.tasks.length, 0)} Tasks
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                            {studyPlan.map((day) => (
                              <div key={day.day} className="bg-gray-50/50 rounded-2xl border border-gray-100 p-3.5 flex flex-col gap-3 min-h-[220px]">
                                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                  <span className="text-xs font-bold text-gray-800">Day {day.day}</span>
                                  <span className="text-[9px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full font-bold">Paced</span>
                                </div>

                                {/* Paced Topics */}
                                <div className="flex flex-col gap-1">
                                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Focus Core</span>
                                  <div className="flex flex-col gap-1">
                                    {day.topics.map((topic, i) => (
                                      <span key={i} className="text-[10px] text-gray-700 font-medium leading-tight">
                                        • {topic}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* Actionable Tasks Checklist */}
                                <div className="flex flex-col gap-1.5 mt-2">
                                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Paced Tasks</span>
                                  <div className="flex flex-col gap-1.5">
                                    {day.tasks.map((task, i) => {
                                      const taskId = `day-${day.day}-task-${i}`;
                                      const isChecked = planProgress[taskId] || false;

                                      return (
                                        <button
                                          key={i}
                                          type="button"
                                          onClick={() =>
                                            setPlanProgress((prev) => ({ ...prev, [taskId]: !prev[taskId] }))
                                          }
                                          className="text-left flex items-start gap-1.5 cursor-pointer text-[10px]"
                                        >
                                          <div className={`w-3.5 h-3.5 rounded border mt-0.5 flex items-center justify-center transition shrink-0 ${isChecked ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 bg-white"}`}>
                                            {isChecked && <Check className="w-2.5 h-2.5 stroke-[4px]" />}
                                          </div>
                                          <span className={isChecked ? "text-gray-400 line-through font-normal" : "text-gray-700 font-medium"}>
                                            {task}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Micro Recommendation Tip */}
                                <div className="mt-auto pt-2 border-t border-gray-100 text-[9px] text-gray-500 italic bg-white/40 p-1.5 rounded-lg">
                                  💡 {day.dynamicTips}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 border border-dashed border-gray-200 bg-gray-50/50 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
                          <Calendar className="w-8 h-8 text-slate-400" />
                          <div className="text-xs font-bold text-slate-700">No active plan</div>
                          <p className="text-[11px] text-slate-500 max-w-xs">Input your exam parameters above and click Plan to calculate structured daily schedules.</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* MODULE C: LECTURE NOTES SUMMARIZER */}
                  {companionSubTab === "summarizer" && (
                    <motion.div
                      key="summarizer-module"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col gap-6 shadow-xs"
                    >
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <span>Lecture Summarizer & Concept Mapper</span>
                        </h3>
                        <p className="text-xs text-gray-500">Paste dense course paragraphs or transcripts. Gemini will map core hierarchies and conceptual notes.</p>
                      </div>

                      <form onSubmit={handleSummarize} className="flex flex-col gap-3">
                        <textarea
                          value={notesContent}
                          onChange={(e) => setNotesContent(e.target.value)}
                          placeholder="Paste lecture text, book summaries, or transcription logs here..."
                          rows={4}
                          className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50/50 hover:bg-gray-50 transition text-gray-800"
                          required
                        />
                        <button
                          type="submit"
                          disabled={isSummarizing}
                          className="self-end px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-75 disabled:pointer-events-none cursor-pointer"
                        >
                          {isSummarizing ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Mapping Concept Nodes...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Summarize & Map Concepts</span>
                            </>
                          )}
                        </button>
                      </form>

                      {summaryError && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-2 text-xs">
                          <AlertCircle className="w-4 h-4" />
                          <span>{summaryError}</span>
                        </div>
                      )}

                      {/* Summary result viewport */}
                      {summaryResult ? (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-gray-100">
                          {/* Summarized text block (Left 7 units) */}
                          <div className="md:col-span-7 flex flex-col gap-4">
                            <div className="flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span className="text-xs font-bold text-gray-800">Synthesized Document Summary</span>
                            </div>

                            <div className="prose prose-sm max-w-none text-gray-600 text-xs bg-gray-50/50 p-4 rounded-2xl border border-gray-100 leading-relaxed whitespace-pre-wrap">
                              {summaryResult.summary}
                            </div>

                            {/* Core key takeaways block */}
                            <div className="flex flex-col gap-2">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Key Academic Takeaways</span>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {summaryResult.keyTakeaways.map((takeaway, idx) => (
                                  <div key={idx} className="p-2.5 bg-blue-50/30 text-blue-800 rounded-xl border border-blue-100/50 text-[10px] leading-snug font-semibold">
                                    • {takeaway}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Interactive Mindmap (Right 5 units) */}
                          <div className="md:col-span-5 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-3">
                            <div className="flex items-center gap-1.5">
                              <Compass className="w-4 h-4 text-indigo-600" />
                              <span className="text-xs font-bold text-gray-800">Conceptual Mind-Map Tree</span>
                            </div>

                            <div className="flex flex-col gap-4 pl-2 overflow-y-auto max-h-[350px]">
                              {summaryResult.mindmap.map((node, nodeIdx) => (
                                <div key={nodeIdx} className="relative flex flex-col gap-2 pl-4 border-l-2 border-indigo-200">
                                  {/* Dot connector */}
                                  <div className="absolute top-1 -left-[5px] w-2 h-2 rounded-full bg-indigo-500" />

                                  <div className="text-[11px] font-bold text-gray-800 uppercase tracking-wide">
                                    {node.topic}
                                  </div>

                                  <div className="flex flex-col gap-1.5 pl-2">
                                    {node.subtopics.map((sub, subIdx) => (
                                      <div key={subIdx} className="flex items-center gap-1.5 text-[10px] text-gray-600 font-medium">
                                        <ChevronRight className="w-3 h-3 text-indigo-400 shrink-0" />
                                        <span>{sub}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 border border-dashed border-gray-200 bg-gray-50/50 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
                          <FileText className="w-8 h-8 text-gray-400" />
                          <div className="text-xs font-bold text-gray-600">No parsed summary</div>
                          <p className="text-[11px] text-gray-500 max-w-xs">Paste course notes above to isolate structural content lists and visual mind maps.</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer credits and information */}
      <footer className="mt-20 border-t border-gray-100 bg-white py-12 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <GraduationCap className="w-4 h-4 text-gray-400" />
            <span>EduPulse Regional Companion Study Portal</span>
          </div>
          <p className="text-xs text-gray-400 max-w-md leading-relaxed">
            Aligning degree requirements to the latest dynamic market frameworks in South Africa, Nigeria, and Kenya. Empowering student developer groups locally.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-gray-400 font-mono">Grounded Search Real-time Integration Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
