import { useRef, useState } from "react";
import axios from "axios";
import "./App.css";

const BACKEND = "http://localhost:8080";

function getErrorMessage(error) {
  const data = error.response?.data;

  if (typeof data === "string") return data;
  if (data?.message) return data.message;

  if (data?.error) {
    return typeof data.error === "string"
      ? data.error
      : JSON.stringify(data.error);
  }

  return error.message || "Something went wrong.";
}

function App() {
  // =========================================================
  // NAVIGATION
  // =========================================================

  const [activePage, setActivePage] = useState("dashboard");

  // =========================================================
  // AUTHENTICATION
  // =========================================================

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("resumehub_token");
  });

  const [authMode, setAuthMode] = useState("login");

  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [authLoading, setAuthLoading] = useState(false);

  // =========================================================
  // RESUME
  // =========================================================

  const [file, setFile] = useState(null);
  const [resumeId, setResumeId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // =========================================================
  // JOBS
  // =========================================================

  const [jobs, setJobs] = useState([]);
  const [jobQuery, setJobQuery] = useState("Java Developer");
  const [jobLocation, setJobLocation] = useState("Bengaluru");
  const [jobType, setJobType] = useState("All");
  const [jobsLoading, setJobsLoading] = useState(false);

  // =========================================================
  // SAVED JOBS
  // =========================================================

  const [savedJobs, setSavedJobs] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("resumehub_saved_jobs")
      ) || [];
    } catch {
      return [];
    }
  });

  // =========================================================
  // JOB DETAILS
  // =========================================================

  const [selectedJob, setSelectedJob] = useState(null);

  // =========================================================
  // MESSAGE
  // =========================================================

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  // =========================================================
  // PROFILE
  // =========================================================

  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("resumehub_profile")
      ) || {
        name: "Nidhi Singh",
        email: "nidhi.singh@example.com",
        location: "India",
        role: "Software Developer",
      };
    } catch {
      return {
        name: "Nidhi Singh",
        email: "nidhi.singh@example.com",
        location: "India",
        role: "Software Developer",
      };
    }
  });

  // =========================================================
  // HELPERS
  // =========================================================

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  const navigate = (page) => {
    setActivePage(page);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // LOGIN / REGISTER
  // =========================================================

  const handleAuth = async (event) => {
    event.preventDefault();

    if (!authForm.email || !authForm.password) {
      showMessage("Please enter email and password.", "error");
      return;
    }

    if (authMode === "register") {
      if (!authForm.name.trim()) {
        showMessage("Please enter your name.", "error");
        return;
      }

      if (authForm.password !== authForm.confirmPassword) {
        showMessage("Passwords do not match.", "error");
        return;
      }
    }

    try {
      setAuthLoading(true);

      const endpoint =
        authMode === "login"
          ? "/api/auth/login"
          : "/api/auth/register";

      const response = await axios.post(
        `${BACKEND}${endpoint}`,
        authMode === "login"
          ? {
              email: authForm.email,
              password: authForm.password,
            }
          : {
              name: authForm.name,
              email: authForm.email,
              password: authForm.password,
            }
      );

      const { token, user } = response.data;

      localStorage.setItem("resumehub_token", token);
      localStorage.setItem(
        "resumehub_user",
        JSON.stringify(user)
      );

      setIsAuthenticated(true);

      if (user) {
        setProfile((previous) => ({
          ...previous,
          name: user.name || previous.name,
          email: user.email || previous.email,
        }));
      }

      showMessage(
        authMode === "login"
          ? "Login successful!"
          : "Account created successfully!",
        "success"
      );

      setAuthForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

    } catch (error) {
      console.error("Authentication error:", error);

      showMessage(
        getErrorMessage(error),
        "error"
      );
    } finally {
      setAuthLoading(false);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("resumehub_token");
    localStorage.removeItem("resumehub_user");

    setIsAuthenticated(false);
    setActivePage("dashboard");

    showMessage("You have been logged out.", "info");
  };

  // =========================================================
  // FILE CHANGE
  // =========================================================

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      showMessage("Please select a PDF file only.", "error");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      showMessage("Resume must be smaller than 10 MB.", "error");
      return;
    }

    setFile(selectedFile);
    setResumeId(null);
    showMessage("Resume selected.", "info");
  };

  // =========================================================
  // DRAG & DROP
  // =========================================================

  const handleDrop = (event) => {
    event.preventDefault();

    const droppedFile = event.dataTransfer.files?.[0];

    if (!droppedFile) return;

    if (droppedFile.type !== "application/pdf") {
      showMessage("Please upload a PDF resume.", "error");
      return;
    }

    if (droppedFile.size > 10 * 1024 * 1024) {
      showMessage("Resume must be smaller than 10 MB.", "error");
      return;
    }

    setFile(droppedFile);
    setResumeId(null);
    showMessage("Resume selected.", "info");
  };

  // =========================================================
  // UPLOAD RESUME
  // =========================================================
  const handleUpload = async () => {

    if (!file) {
      showMessage("Please select a PDF resume first.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {

      setUploading(true);
      showMessage("Uploading your resume...", "info");

      const token = localStorage.getItem("resumehub_token");

      const response = await axios.post(
        `${BACKEND}/api/resumes/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResumeId(response.data.id);

      showMessage(
        `Resume uploaded successfully! Resume ID: ${response.data.id}`,
        "success"
      );

    } catch (error) {

      console.error("Upload error:", error);

      showMessage(
        "Upload failed: " + getErrorMessage(error),
        "error"
      );

    } finally {

      setUploading(false);

    }
  };
  // =========================================================
  // JOB SEARCH
  // =========================================================

  const handleJobSearch = async () => {
    if (!jobQuery.trim()) {
      showMessage("Please enter a job role.", "error");
      return;
    }

    if (!jobLocation.trim()) {
      showMessage("Please enter a location.", "error");
      return;
    }

    try {
      setJobsLoading(true);
      showMessage("Searching job listings...", "info");

      const response = await axios.get(
        `${BACKEND}/api/jobs/search`,
        {
          params: {
            query: jobQuery,
            location: jobLocation,
          },
        }
      );

      const receivedJobs = Array.isArray(response.data)
        ? response.data
        : [];

      setJobs(receivedJobs);

      if (receivedJobs.length === 0) {
        showMessage("No jobs found for this search.", "info");
      } else {
        showMessage(
          `${receivedJobs.length} job listings found.`,
          "success"
        );
      }
    } catch (error) {
      console.error("Job search error:", error);

      setJobs([]);

      showMessage(
        "Job search failed: " + getErrorMessage(error),
        "error"
      );
    } finally {
      setJobsLoading(false);
    }
  };

  // =========================================================
  // QUICK SEARCH
  // =========================================================

  const quickSearch = (role, location) => {
    setJobQuery(role);
    setJobLocation(location);
    setActivePage("jobs");

    setTimeout(() => {
      searchWithValues(role, location);
    }, 100);
  };

  const searchWithValues = async (role, location) => {
    try {
      setJobsLoading(true);

      const response = await axios.get(
        `${BACKEND}/api/jobs/search`,
        {
          params: {
            query: role,
            location: location,
          },
        }
      );

      const receivedJobs = Array.isArray(response.data)
        ? response.data
        : [];

      setJobs(receivedJobs);

      if (receivedJobs.length > 0) {
        showMessage(
          `${receivedJobs.length} jobs found.`,
          "success"
        );
      } else {
        showMessage("No jobs found.", "info");
      }
    } catch (error) {
      setJobs([]);

      showMessage(
        "Job search failed: " + getErrorMessage(error),
        "error"
      );
    } finally {
      setJobsLoading(false);
    }
  };

  // =========================================================
  // SAVE JOB
  // =========================================================

  const isJobSaved = (job) => {
    return savedJobs.some(
      (saved) =>
        saved.jobId === job.jobId ||
        saved.url === job.url
    );
  };

  const toggleSaveJob = (job) => {
    let updatedJobs;

    if (isJobSaved(job)) {
      updatedJobs = savedJobs.filter(
        (saved) =>
          saved.jobId !== job.jobId &&
          saved.url !== job.url
      );

      showMessage("Job removed from saved jobs.", "info");
    } else {
      updatedJobs = [...savedJobs, job];

      showMessage("Job saved successfully.", "success");
    }

    setSavedJobs(updatedJobs);

    localStorage.setItem(
      "resumehub_saved_jobs",
      JSON.stringify(updatedJobs)
    );
  };

  // =========================================================
  // PROFILE
  // =========================================================

  const saveProfile = () => {
    localStorage.setItem(
      "resumehub_profile",
      JSON.stringify(profile)
    );

    showMessage("Profile updated successfully.", "success");
  };

  // =========================================================
  // DATE
  // =========================================================

  const formatJobDate = (date) => {
    if (!date) return "Recently posted";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Recently posted";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // FILTER JOBS
  // =========================================================

  const filteredJobs = jobs.filter((job) => {
      if (jobType === "All") {
        return true;
      }

      const employmentType = (
        job.employmentType || ""
      ).toLowerCase();

      const workModel = (
        job.workModel || ""
      ).toLowerCase();

      const title = (
        job.title || ""
      ).toLowerCase();

      const description = (
        job.description || ""
      ).toLowerCase();

      const combinedText =
        `${employmentType} ${workModel} ${title} ${description}`;

      switch (jobType) {
        case "Full-time":
          return (
            combinedText.includes("full-time") ||
            combinedText.includes("full time") ||
            combinedText.includes("fulltime")
          );

        case "Part-time":
          return (
            combinedText.includes("part-time") ||
            combinedText.includes("part time") ||
            combinedText.includes("parttime")
          );

        case "Internship":
          return (
            combinedText.includes("internship") ||
            combinedText.includes("intern") ||
            combinedText.includes("trainee")
          );

        case "Contract":
          return (
            combinedText.includes("contract") ||
            combinedText.includes("contractor")
          );

        default:
          return true;
      }
    });

  // =========================================================
  // JOB CARD
  // =========================================================

  const JobCard = ({ job }) => {
    const saved = isJobSaved(job);

    return (
      <article className="job-card">

        <div className="job-card-top">

          <div className="company-logo">
            {(job.company || "C")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="job-card-actions">

            <span className="source-badge">
              Adzuna
            </span>

            <button
              className={`save-icon ${saved ? "saved" : ""}`}
              onClick={() => toggleSaveJob(job)}
              title={saved ? "Remove saved job" : "Save job"}
            >
              {saved ? "♥" : "♡"}
            </button>

          </div>

        </div>

        <h3>
          {job.title || "Job Title"}
        </h3>

        <p className="company-name">
          {job.company || "Company not specified"}
        </p>

        <div className="job-meta">

          <span>
            📍 {job.location || "Location not specified"}
          </span>

          <span>
            💼 {job.employmentType || "Full-time"}
          </span>

        </div>

        {(job.salaryMin != null ||
          job.salaryMax != null) && (

          <div className="salary-box">

            <span>₹</span>

            <div>

              <strong>

                {job.salaryMin != null &&
                  `₹${Math.round(
                    job.salaryMin
                  ).toLocaleString("en-IN")}`}

                {job.salaryMin != null &&
                  job.salaryMax != null &&
                  " – "}

                {job.salaryMax != null &&
                  `₹${Math.round(
                    job.salaryMax
                  ).toLocaleString("en-IN")}`}

              </strong>

              {job.salaryPredicted && (
                <small>
                  Estimated salary
                </small>
              )}

            </div>

          </div>
        )}

        {job.description && (
          <p className="job-description">
            {job.description.length > 180
              ? `${job.description.substring(0, 180)}...`
              : job.description}
          </p>
        )}

        <div className="job-footer">

          <span className="posted-date">
            Posted {formatJobDate(job.created)}
          </span>

          <button
            className="view-job-button"
            onClick={() => setSelectedJob(job)}
          >
            View Details
            <span>→</span>
          </button>

        </div>

        <div className="adzuna-attribution">
          External listing via Adzuna
        </div>

      </article>
    );
  };

  // =========================================================
  // DASHBOARD
  // =========================================================

  const Dashboard = () => (
    <>
      <div className="page-header">

        <div>
          <span className="page-eyebrow">
            DASHBOARD
          </span>

          <h1>
            Welcome back, {profile.name.split(" ")[0]} 👋
          </h1>

          <p>
            Manage your resume and discover your next career opportunity.
          </p>
        </div>

        <button
          className="primary-button header-button"
          onClick={() => navigate("jobs")}
        >
          Find Jobs →
        </button>

      </div>

      <div className="dashboard-stats">

        <div className="dashboard-stat blue">

          <div className="dashboard-stat-icon">
            📄
          </div>

          <div>
            <span>Resume Status</span>
            <strong>
              {resumeId ? "Uploaded" : "Not Uploaded"}
            </strong>
          </div>

        </div>

        <div className="dashboard-stat purple">

          <div className="dashboard-stat-icon">
            💼
          </div>

          <div>
            <span>Jobs Found</span>
            <strong>
              {jobs.length}
            </strong>
          </div>

        </div>

        <div className="dashboard-stat red">

          <div className="dashboard-stat-icon">
            ♥
          </div>

          <div>
            <span>Saved Jobs</span>
            <strong>
              {savedJobs.length}
            </strong>
          </div>

        </div>

      </div>

      <div className="dashboard-grid">

        <section className="dashboard-card resume-dashboard-card">

          <div className="card-heading">

            <div>
              <span className="card-eyebrow">
                YOUR RESUME
              </span>

              <h2>
                Resume management
              </h2>
            </div>

            <span className="card-icon">
              📄
            </span>

          </div>

          {resumeId ? (

            <div className="resume-preview">

              <div className="resume-file-icon">
                PDF
              </div>

              <div className="resume-file-info">

                <strong>
                  {file?.name || "Uploaded Resume"}
                </strong>

                <span>
                  Resume ID #{resumeId}
                </span>

              </div>

              <span className="uploaded-badge">
                Uploaded
              </span>

            </div>

          ) : (

            <div className="resume-empty">

              <div className="resume-empty-icon">
                ↑
              </div>

              <div>
                <strong>
                  Your resume isn't uploaded yet
                </strong>

                <p>
                  Upload your latest PDF resume to keep it available in your profile.
                </p>
              </div>

            </div>

          )}

          <button
            className="secondary-button full-button"
            onClick={() => navigate("resume")}
          >
            {resumeId ? "Manage Resume" : "Upload Resume"}
            <span>→</span>
          </button>

        </section>


        <section className="dashboard-card">

          <div className="card-heading">

            <div>
              <span className="card-eyebrow">
                QUICK SEARCH
              </span>

              <h2>
                Find opportunities
              </h2>
            </div>

            <span className="card-icon">
              🔎
            </span>

          </div>

          <div className="quick-search-list">

            <button
              onClick={() =>
                quickSearch(
                  "Java Developer",
                  "Bengaluru"
                )
              }
            >
              <span>☕</span>
              <div>
                <strong>Java Developer</strong>
                <small>Bengaluru</small>
              </div>
              <span>→</span>
            </button>

            <button
              onClick={() =>
                quickSearch(
                  "Software Developer",
                  "Hyderabad"
                )
              }
            >
              <span>💻</span>
              <div>
                <strong>Software Developer</strong>
                <small>Hyderabad</small>
              </div>
              <span>→</span>
            </button>

            <button
              onClick={() =>
                quickSearch(
                  "Full Stack Developer",
                  "Bengaluru"
                )
              }
            >
              <span>⚡</span>
              <div>
                <strong>Full Stack Developer</strong>
                <small>Bengaluru</small>
              </div>
              <span>→</span>
            </button>

          </div>

        </section>

      </div>

      <section className="dashboard-card recent-section">

        <div className="section-row">

          <div>
            <span className="card-eyebrow">
              JOB DISCOVERY
            </span>

            <h2>
              Latest opportunities
            </h2>
          </div>

          <button
            className="text-button"
            onClick={() => navigate("jobs")}
          >
            View all jobs →
          </button>

        </div>

        {jobs.length > 0 ? (

          <div className="mini-job-grid">

            {jobs.slice(0, 3).map((job, index) => (
              <JobCard
                key={job.jobId || index}
                job={job}
              />
            ))}

          </div>

        ) : (

          <div className="no-recent-jobs">

            <span>💼</span>

            <div>
              <strong>
                Start discovering jobs
              </strong>

              <p>
                Search for your target role and location to see opportunities here.
              </p>
            </div>

            <button
              className="secondary-button"
              onClick={() => navigate("jobs")}
            >
              Search Jobs
            </button>

          </div>

        )}

      </section>
    </>
  );

  // =========================================================
  // RESUME PAGE
  // =========================================================

  const ResumePage = () => (
    <>
      <div className="page-header">

        <div>
          <span className="page-eyebrow">
            MY RESUME
          </span>

          <h1>
            Manage your resume
          </h1>

          <p>
            Upload and manage your latest resume.
          </p>
        </div>

      </div>

      <section className="content-card">

        <div className="resume-upload-large">

          <div className="upload-large-icon">
            📄
          </div>

          <h2>
            {file
              ? "Resume selected"
              : "Upload your resume"}
          </h2>

          <p>
            Upload a PDF resume up to 10 MB.
          </p>

          <div
            className="large-drop-zone"
            onDragOver={(event) =>
              event.preventDefault()
            }
            onDrop={handleDrop}
            onClick={() =>
              fileInputRef.current?.click()
            }
          >

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              hidden
            />

            <span className="cloud-icon">
              ☁
            </span>

            <strong>
              Drop your PDF here
            </strong>

            <span>
              or click to browse your computer
            </span>

          </div>

          {file && (

            <div className="selected-file">

              <div className="selected-file-left">

                <div className="pdf-icon">
                  PDF
                </div>

                <div>

                  <strong>
                    {file.name}
                  </strong>

                  <span>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>

                </div>

              </div>

              <span className="ready-badge">
                Ready
              </span>

            </div>

          )}

          <button
            className="primary-button upload-main-button"
            onClick={handleUpload}
            disabled={uploading || !file}
          >
            {uploading ? (
              <>
                <span className="spinner"></span>
                Uploading...
              </>
            ) : (
              <>
                Upload Resume
                <span>→</span>
              </>
            )}
          </button>

        </div>

      </section>

      {resumeId && (

        <section className="content-card">

          <div className="section-row">

            <div>
              <span className="card-eyebrow">
                STORED RESUME
              </span>

              <h2>
                Resume information
              </h2>
            </div>

            <span className="uploaded-badge">
              ✓ Uploaded
            </span>

          </div>

          <div className="resume-info-panel">

            <div className="resume-info-icon">
              PDF
            </div>

            <div>
              <strong>
                {file?.name || "Resume PDF"}
              </strong>

              <span>
                Stored in your ResumeHub account
              </span>

              <small>
                Resume ID #{resumeId}
              </small>
            </div>

          </div>

        </section>

      )}
    </>
  );

  // =========================================================
  // JOBS PAGE
  // =========================================================

  const JobsPage = () => (
    <>
      <div className="page-header">

        <div>
          <span className="page-eyebrow">
            JOB SEARCH
          </span>

          <h1>
            Find your next opportunity
          </h1>

          <p>
            Search external job advertisements by role and location.
          </p>
        </div>

      </div>

      <section className="job-search-panel">

        <div className="search-panel-grid">

          <div className="search-field">

            <label>
              Job role
            </label>

            <div className="input-wrapper">

              <span>⌕</span>

              <input
                value={jobQuery}
                onChange={(event) =>
                  setJobQuery(event.target.value)
                }
                placeholder="Java Developer"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleJobSearch();
                  }
                }}
              />

            </div>

          </div>

          <div className="search-field">

            <label>
              Location
            </label>

            <div className="input-wrapper">

              <span>⌖</span>

              <input
                value={jobLocation}
                onChange={(event) =>
                  setJobLocation(event.target.value)
                }
                placeholder="Bengaluru"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleJobSearch();
                  }
                }}
              />

            </div>

          </div>

          <button
            className="primary-button search-main-button"
            onClick={handleJobSearch}
            disabled={jobsLoading}
          >
            {jobsLoading ? (
              <>
                <span className="spinner"></span>
                Searching
              </>
            ) : (
              <>
                Search Jobs
                <span>→</span>
              </>
            )}
          </button>

        </div>

        <div className="popular-searches">

          <span>
            Popular searches
          </span>

          <button
            onClick={() =>
              quickSearch(
                "Java Developer",
                "Bengaluru"
              )
            }
          >
            Java Developer
          </button>

          <button
            onClick={() =>
              quickSearch(
                "Software Developer",
                "Hyderabad"
              )
            }
          >
            Software Developer
          </button>

          <button
            onClick={() =>
              quickSearch(
                "Frontend Developer",
                "Bengaluru"
              )
            }
          >
            Frontend Developer
          </button>

          <button
            onClick={() =>
              quickSearch(
                "Backend Developer",
                "Delhi"
              )
            }
          >
            Backend Developer
          </button>

        </div>

      </section>

      <div className="jobs-layout">

        <aside className="filters-panel">

          <div className="filter-header">
            <h3>
              Filters
            </h3>

            <button
              onClick={() => setJobType("All")}
            >
              Reset
            </button>
          </div>

          <div className="filter-group">

            <label>
              Employment type
            </label>

            <button
              className={jobType === "All" ? "active" : ""}
              onClick={() => setJobType("All")}
            >
              <span>All jobs</span>
              <span>•</span>
            </button>

            <button
              className={
                jobType === "Full-time"
                  ? "active"
                  : ""
              }
              onClick={() => setJobType("Full-time")}
            >
              <span>Full-time</span>
            </button>

            <button
              className={
                jobType === "Part-time"
                  ? "active"
                  : ""
              }
              onClick={() => setJobType("Part-time")}
            >
              <span>Part-time</span>
            </button>

            <button
              className={
                jobType === "Internship"
                  ? "active"
                  : ""
              }
              onClick={() => setJobType("Internship")}
            >
              <span>Internship</span>
            </button>
            
            <button
              className={
                jobType === "Contract"
                  ? "active"
                  : ""
              }
              onClick={() => setJobType("Contract")}
            >
              <span>Contract</span>
            </button>

          </div>

          <div className="filter-info">

            <span>💡</span>

            <p>
              Job listings are provided through Adzuna and may link to external application pages.
            </p>

          </div>

        </aside>

        <main className="jobs-results-area">

          <div className="results-toolbar">

            <div>

              <strong>
                {filteredJobs.length}
              </strong>

              <span>
                opportunities
              </span>

            </div>

            <span className="results-location">
              📍 {jobLocation}
            </span>

          </div>

          {jobsLoading ? (

            <div className="loading-state">

              <span className="large-spinner"></span>

              <h3>
                Finding opportunities...
              </h3>

              <p>
                Searching external job listings.
              </p>

            </div>

          ) : filteredJobs.length > 0 ? (

            <div className="jobs-list">

              {filteredJobs.map((job, index) => (
                <JobCard
                  key={job.jobId || index}
                  job={job}
                />
              ))}

            </div>

          ) : (

            <div className="empty-state-large">

              <div>
                🔎
              </div>

              <h2>
                Find your next opportunity
              </h2>

              <p>
                Enter a role and location above to discover available job listings.
              </p>

            </div>

          )}

        </main>

      </div>
    </>
  );

  // =========================================================
  // SAVED JOBS PAGE
  // =========================================================

  const SavedJobsPage = () => (
    <>
      <div className="page-header">

        <div>
          <span className="page-eyebrow">
            SAVED JOBS
          </span>

          <h1>
            Your saved opportunities
          </h1>

          <p>
            Keep track of jobs you want to revisit.
          </p>
        </div>

      </div>

      {savedJobs.length > 0 ? (

        <div className="saved-jobs-grid">

          {savedJobs.map((job, index) => (
            <JobCard
              key={job.jobId || index}
              job={job}
            />
          ))}

        </div>

      ) : (

        <section className="empty-state-large saved-empty">

          <div>
            ♡
          </div>

          <h2>
            No saved jobs yet
          </h2>

          <p>
            Save interesting opportunities from the job search page and they will appear here.
          </p>

          <button
            className="primary-button"
            onClick={() => navigate("jobs")}
          >
            Find Jobs →
          </button>

        </section>

      )}
    </>
  );

  // =========================================================
  // PROFILE PAGE
  // =========================================================

  const ProfilePage = () => (
    <>
      <div className="page-header">

        <div>
          <span className="page-eyebrow">
            PROFILE
          </span>

          <h1>
            Your profile
          </h1>

          <p>
            Keep your basic information up to date.
          </p>
        </div>

      </div>

      <section className="profile-card">

        <div className="profile-cover">
          <div className="profile-avatar">
            {profile.name
              .charAt(0)
              .toUpperCase()}
          </div>
        </div>

        <div className="profile-content">

          <div className="profile-intro">

            <h2>
              {profile.name}
            </h2>

            <p>
              {profile.role}
            </p>

          </div>

          <div className="profile-form">

            <div className="form-group">

              <label>
                Full name
              </label>

              <input
                value={profile.name}
                onChange={(event) =>
                  setProfile({
                    ...profile,
                    name: event.target.value,
                  })
                }
              />

            </div>

            <div className="form-group">

              <label>
                Email
              </label>

              <input
                value={profile.email}
                onChange={(event) =>
                  setProfile({
                    ...profile,
                    email: event.target.value,
                  })
                }
              />

            </div>

            <div className="form-group">

              <label>
                Preferred role
              </label>

              <input
                value={profile.role}
                onChange={(event) =>
                  setProfile({
                    ...profile,
                    role: event.target.value,
                  })
                }
              />

            </div>

            <div className="form-group">

              <label>
                Location
              </label>

              <input
                value={profile.location}
                onChange={(event) =>
                  setProfile({
                    ...profile,
                    location: event.target.value,
                  })
                }
              />

            </div>

          </div>

          <button
            className="primary-button save-profile-button"
            onClick={saveProfile}
          >
            Save Profile
            <span>✓</span>
          </button>

        </div>

      </section>

    </>
  );

  // =========================================================
  // JOB DETAILS MODAL
  // =========================================================

  const JobDetailsModal = () => {
    if (!selectedJob) return null;

    return (
      <div
        className="modal-overlay"
        onClick={() => setSelectedJob(null)}
      >

        <div
          className="job-modal"
          onClick={(event) =>
            event.stopPropagation()
          }
        >

          <button
            className="modal-close"
            onClick={() => setSelectedJob(null)}
          >
            ×
          </button>

          <div className="modal-company">

            <div className="modal-company-logo">
              {(selectedJob.company || "C")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>

              <h2>
                {selectedJob.title || "Job Title"}
              </h2>

              <p>
                {selectedJob.company ||
                  "Company not specified"}
              </p>

            </div>

          </div>

          <div className="modal-meta">

            <span>
              📍 {selectedJob.location || "Location not specified"}
            </span>

            <span>
              💼 {selectedJob.employmentType || "Full-time"}
            </span>

            <span>
              📅 {formatJobDate(selectedJob.created)}
            </span>

          </div>

          {(selectedJob.salaryMin != null ||
            selectedJob.salaryMax != null) && (

            <div className="modal-salary">

              <strong>
                Salary
              </strong>

              <span>

                {selectedJob.salaryMin != null &&
                  `₹${Math.round(
                    selectedJob.salaryMin
                  ).toLocaleString("en-IN")}`}

                {selectedJob.salaryMin != null &&
                  selectedJob.salaryMax != null &&
                  " – "}

                {selectedJob.salaryMax != null &&
                  `₹${Math.round(
                    selectedJob.salaryMax
                  ).toLocaleString("en-IN")}`}

              </span>

            </div>

          )}

          <div className="modal-description">

            <h3>
              Job description
            </h3>

            <p>
              {selectedJob.description ||
                "No detailed description was provided for this listing."}
            </p>

          </div>

          <div className="modal-footer">

            <button
              className={`save-modal-button ${
                isJobSaved(selectedJob)
                  ? "saved"
                  : ""
              }`}
              onClick={() =>
                toggleSaveJob(selectedJob)
              }
            >
              {isJobSaved(selectedJob)
                ? "♥ Saved"
                : "♡ Save Job"}
            </button>

            {selectedJob.url && (
              <a
                href={selectedJob.url}
                target="_blank"
                rel="noopener noreferrer"
                className="apply-modal-button"
              >
                View Original Job ↗
              </a>
            )}

          </div>

          <div className="modal-attribution">
            External job listing provided through Adzuna.
          </div>

        </div>

      </div>
    );
  };
  if (!isAuthenticated) {
    return (
      <div className="auth-page">

        <div className="auth-card">

          <div className="auth-brand">
            <div className="brand-icon">
              💼
            </div>

            <div>
              <strong>ResumeHub</strong>
              <span>Career Portal</span>
            </div>
          </div>

          <div className="auth-heading">
            <h1>
              {authMode === "login"
                ? "Welcome back"
                : "Create your account"}
            </h1>

            <p>
              {authMode === "login"
                ? "Sign in to continue to ResumeHub."
                : "Create your ResumeHub account to get started."}
            </p>
          </div>

          <div className="auth-tabs">

            <button
              className={
                authMode === "login"
                  ? "auth-tab active"
                  : "auth-tab"
              }
              onClick={() => setAuthMode("login")}
            >
              Login
            </button>

            <button
              className={
                authMode === "register"
                  ? "auth-tab active"
                  : "auth-tab"
              }
              onClick={() => setAuthMode("register")}
            >
              Create Account
            </button>

          </div>

          <form onSubmit={handleAuth}>

            {authMode === "register" && (
              <div className="auth-field">

                <label>Full Name</label>

                <input
                  type="text"
                  value={authForm.name}
                  onChange={(event) =>
                    setAuthForm({
                      ...authForm,
                      name: event.target.value,
                    })
                  }
                  placeholder="Enter your name"
                />

              </div>
            )}

            <div className="auth-field">

              <label>Email</label>

              <input
                type="email"
                value={authForm.email}
                onChange={(event) =>
                  setAuthForm({
                    ...authForm,
                    email: event.target.value,
                  })
                }
                placeholder="Enter your email"
              />

            </div>

            <div className="auth-field">

              <label>Password</label>

              <input
                type="password"
                value={authForm.password}
                onChange={(event) =>
                  setAuthForm({
                    ...authForm,
                    password: event.target.value,
                  })
                }
                placeholder="Enter your password"
              />

            </div>

            {authMode === "register" && (
              <div className="auth-field">

                <label>Confirm Password</label>

                <input
                  type="password"
                  value={authForm.confirmPassword}
                  onChange={(event) =>
                    setAuthForm({
                      ...authForm,
                      confirmPassword: event.target.value,
                    })
                  }
                  placeholder="Confirm your password"
                />

              </div>
            )}

            <button
              type="submit"
              className="primary-button auth-submit"
              disabled={authLoading}
            >
              {authLoading
                ? "Please wait..."
                : authMode === "login"
                ? "Login →"
                : "Create Account →"}
            </button>

          </form>

        </div>

      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="sidebar-brand">

          <div className="brand-icon">
            💼
          </div>

          <div>
            <strong>
              ResumeHub
            </strong>

            <span>
              Career Portal
            </span>
          </div>

        </div>

        <nav className="sidebar-nav">

          <span className="nav-label">
            WORKSPACE
          </span>

          <button
            className={
              activePage === "dashboard"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => navigate("dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className={
              activePage === "resume"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => navigate("resume")}
          >
            <span>▣</span>
            My Resume
          </button>

          <button
            className={
              activePage === "jobs"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => navigate("jobs")}
          >
            <span>⌕</span>
            Find Jobs
          </button>

          <button
            className={
              activePage === "saved"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => navigate("saved")}
          >
            <span>♡</span>
            Saved Jobs

            {savedJobs.length > 0 && (
              <b className="nav-count">
                {savedJobs.length}
              </b>
            )}

          </button>

          <span className="nav-label second">
            ACCOUNT
          </span>

          <button
            className={
              activePage === "profile"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => navigate("profile")}
          >
            <span>◉</span>
            Profile
          </button>

        </nav>

        <div className="sidebar-bottom">

          <div className="sidebar-help">

            <span>
              💡
            </span>

            <div>
              <strong>
                Career tip
              </strong>

              <p>
                Keep your resume updated before applying.
              </p>
            </div>

          </div>

          <div className="sidebar-user">
            <div className="small-avatar">
              {profile.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{profile.name}</strong>
              <span>{profile.role}</span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={() => {
              console.log("LOGOUT CLICKED");
              handleLogout();
            }}
          >
            <span>↪</span>
            Logout
          </button>

          

        </div>

      </aside>


      {/* MAIN AREA */}

      <div className="main-area">

        <header className="topbar">

          <div className="breadcrumb">
            ResumeHub
            <span>/</span>

            {activePage === "dashboard" && "Dashboard"}
            {activePage === "resume" && "My Resume"}
            {activePage === "jobs" && "Find Jobs"}
            {activePage === "saved" && "Saved Jobs"}
            {activePage === "profile" && "Profile"}
          </div>

          <div className="topbar-actions">

            <button
              className="topbar-search"
              onClick={() => navigate("jobs")}
            >
              <span>⌕</span>
              Search jobs
              <kbd>⌘ K</kbd>
            </button>

            <button
              className="topbar-avatar"
              onClick={() => navigate("profile")}
            >
              {profile.name
                .charAt(0)
                .toUpperCase()}
            </button>

          </div>

        </header>

        <main className="page-container">

          {activePage === "dashboard" && Dashboard ()}

          {activePage === "resume" && ResumePage()}

          {activePage === "jobs" && JobsPage()}

          {activePage === "saved" && SavedJobsPage()}

          {activePage === "profile" && ProfilePage()}

        </main>

        <footer className="app-footer">

          <div>
            <strong>
              ResumeHub
            </strong>

            <span>
              Resume & Job Portal
            </span>
          </div>

          <span>
            Job listings powered by Adzuna
          </span>

        </footer>

      </div>


      {/* JOB MODAL */}

      <JobDetailsModal />


      {/* TOAST */}

      {message && (

        <div className={`toast ${messageType}`}>

          <div className="toast-icon">
            {messageType === "success"
              ? "✓"
              : messageType === "error"
              ? "!"
              : "i"}
          </div>

          <span>
            {message}
          </span>

          <button
            className="toast-close"
            onClick={() => setMessage("")}
          >
            ×
          </button>

        </div>

      )}

    </div>
  );
}

export default App;