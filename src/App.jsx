import { useEffect, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ClipboardList,
  ChevronRight,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  RotateCcw,
  Settings2,
  Sparkles,
  UserRound,
  Download,
  Upload,
  Trash2,} from 'lucide-react'
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { buildPreferencesFromAnswers } from './utils/personalization.js'
import PreferencesQuiz from './pages/PreferencesQuiz.jsx'
import PreferencesResult from './pages/PreferencesResult.jsx'
import StudyMode from './pages/StudyMode.jsx'
import JobComparison from './pages/JobComparison.jsx'
import './App.css'

const STORAGE_KEY = 'choivia:v1'

const defaultPreferences = {
  explanation: 'detailed',
  layout: 'overview',
  reminders: true,
}

const defaultCompleted = {
  internship: ['requirements', 'deadline', 'cv'],
  courses: ['degree', 'schedule'],
  jobs: [],
  documents: [],
}

const guides = [
  {
    id: 'internship',
    title: 'Internship application',
    category: 'CAREER',
    summary: 'Prepare your documents and move towards your next opportunity.',
    icon: BriefcaseBusiness,
    tone: 'sage',
    duration: '25–35 min',
    steps: [
      { id: 'requirements', title: 'Confirm internship requirements', description: 'Check your department’s official internship rules and eligibility requirements.' },
      { id: 'deadline', title: 'Check important dates', description: 'Confirm application deadlines and the dates of your planned internship.' },
      { id: 'cv', title: 'Prepare your CV', description: 'Update your contact details, education, skills and relevant experience.' },
      { id: 'transcript', title: 'Gather required documents', description: 'Check whether a transcript, student certificate or other document is needed.' },
      { id: 'coordinator', title: 'Contact your internship coordinator', description: 'Ask about any department-specific requirements.', required: false },
      { id: 'submit', title: 'Submit your application', description: 'Review the information and submit everything through the official channel.', dependsOn: ['cv', 'transcript'] },
      { id: 'confirmation', title: 'Save the confirmation', description: 'Keep the application receipt or confirmation email for your records.', dependsOn: ['submit'] },
    ],
  },
  {
    id: 'courses',
    title: 'Course registration',
    category: 'ACADEMICS',
    summary: 'Organize your course choices before completing registration.',
    icon: GraduationCap,
    tone: 'lilac',
    duration: '15–25 min',
    steps: [
      { id: 'degree', title: 'Review degree requirements', description: 'Check your curriculum and the courses you still need to complete.' },
      { id: 'schedule', title: 'Check the course schedule', description: 'Review course times and look for timetable conflicts.' },
      { id: 'prerequisites', title: 'Confirm prerequisites', description: 'Check that you meet the prerequisites for your selected courses.' },
      { id: 'shortlist', title: 'Choose your courses', description: 'Create a shortlist that fits your academic plan.' },
      { id: 'credits', title: 'Review your credit load', description: 'Confirm your total credits and any relevant registration limits.' },
      { id: 'register', title: 'Complete registration', description: 'Submit your final choices and keep a copy of the confirmation.' },
    ],
  },
  {
    id: 'jobs',
    title: 'Job application',
    category: 'CAREER',
    summary: 'Keep the important parts of your job application in one place.',
    icon: BookOpen,
    tone: 'peach',
    duration: '20–30 min',
    steps: [
      { id: 'role', title: 'Define your target role', description: 'Review the job description and note the main requirements.' },
      { id: 'cv', title: 'Tailor your CV', description: 'Highlight the skills and experience most relevant to the role.' },
      { id: 'letter', title: 'Prepare supporting materials', description: 'Write a cover letter or prepare any requested work samples.' },
      { id: 'apply', title: 'Submit your application', description: 'Check the details before using the employer’s official application channel.' },
      { id: 'track', title: 'Record the outcome', description: 'Save the application date and note any follow-up actions.' },
    ],
  },
  {
    id: 'documents',
    title: 'Document preparation',
    category: 'ORGANIZATION',
    summary: 'Make sure important documents are ready when you need them.',
    icon: FileText,
    tone: 'blue',
    duration: '10–20 min',
    steps: [
      { id: 'list', title: 'List the required documents', description: 'Use the official instructions to create your document list.' },
      { id: 'validity', title: 'Check validity and dates', description: 'Review expiry dates and any document-specific conditions.' },
      { id: 'copies', title: 'Prepare digital copies', description: 'Create clear, readable files in the requested formats.' },
      { id: 'backup', title: 'Store a backup', description: 'Keep a secure backup and make sure you can find the files later.' },
    ],
  },
]


const detailedGuidance = {
  requirements: 'Check eligibility, required duration, approvals and documents in the latest official department guidance.',
  deadline: 'Write down the application deadline and planned dates. Check whether any approval must happen before the process begins.',
  cv: 'Keep the document readable and up to date. Highlight information relevant to the internship or role without adding unverified claims.',
  transcript: 'Check the requested format and whether the institution requires an official copy. Follow the receiving organisation’s instructions.',
  coordinator: 'Prepare specific questions about requirements, approval and the next action. Verify important answers with the relevant official source.',
  submit: 'Review required fields, file formats and document completeness before submitting through the official channel.',
  confirmation: 'Keep the receipt or confirmation details somewhere easy to find. Note any reference number and follow-up date.',
  degree: 'Compare completed courses with the official curriculum. If a requirement is unclear, confirm it with your academic advisor.',
  schedule: 'Check for overlapping sessions, exam dates and other fixed commitments before finalising your choices.',
  prerequisites: 'Use the official course catalogue to confirm prerequisites and any registration restrictions.',
  shortlist: 'Compare your choices with degree requirements, timetable constraints and learning priorities.',
  credits: 'Check the current credit limits and any approval requirements that apply to your programme.',
  register: 'Review the final selection before submitting. Keep a copy of the registration confirmation and verify the result in the official system.',
  role: 'Identify the main responsibilities and required skills. Note which parts of your experience provide relevant evidence.',
  letter: 'Follow the employer’s instructions and tailor your materials to the role. Check spelling, contact information and requested file formats.',
  apply: 'Check all entries and attachments against the job description before submitting through the employer’s official channel.',
  track: 'Record the application date and expected follow-up. Avoid storing confidential employer information in shared notes.',
  list: 'Use the receiving organisation’s current instructions to identify each required document and any format requirements.',
  validity: 'Check expiry dates, issue dates and whether the receiving organisation requires a recently issued copy.',
  copies: 'Use clear, legible files with descriptive filenames. Follow the requested file type and size limits.',
  backup: 'Store copies in a location you control and can retrieve later. Avoid placing sensitive documents in a public or shared folder.',
}

function loadSavedState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      return { completed: defaultCompleted, preferences: defaultPreferences, questionnaire: null }
    }

    const parsed = JSON.parse(saved)
    if (parsed?.version !== 1) {
      return { completed: defaultCompleted, preferences: defaultPreferences, questionnaire: null }
    }

    return {
      completed: { ...defaultCompleted, ...parsed.completed },
      preferences: { ...defaultPreferences, ...parsed.preferences },
      questionnaire: parsed.questionnaire ?? null,
    }
  } catch {
    return { completed: defaultCompleted, preferences: defaultPreferences, questionnaire: null }
  }
}

function getProgress(guide, completedIds = []) {
  const requiredSteps = guide.steps.filter((step) => step.required !== false)
  const done = requiredSteps.filter((step) => completedIds.includes(step.id)).length

  return {
    done,
    total: requiredSteps.length,
    percent: requiredSteps.length ? Math.round((done / requiredSteps.length) * 100) : 0,
  }
}

function ProgressBar({ percent }) {
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-label="Required steps completed"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
    >
      <div className="progress-fill" style={{ width: `${percent}%` }} />
    </div>
  )
}

function Sidebar() {
  const navigation = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/guides', label: 'All guides', icon: ListChecks },
    { to: '/progress', label: 'My progress', icon: CheckCircle2 },
    { to: '/profile', label: 'Preferences', icon: UserRound },
    { to: '/study', label: 'Usability study', icon: ClipboardList },
  ]

  return (
    <aside className="sidebar">
      <Link to="/" className="brand" aria-label="Choivia home">
        <span className="brand-mark">c<span>.</span></span>
        <span className="brand-name">choivia</span>
      </Link>

      <div className="sidebar-label">YOUR WORKSPACE</div>
      <nav className="side-nav" aria-label="Main navigation">
        {navigation.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
            {label === 'All guides' && <span className="nav-count">4</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-note-icon"><Sparkles size={17} /></div>
        <p className="sidebar-note-title">Small steps add up.</p>
        <p className="sidebar-note-text">
          You don’t have to do everything today. Just find your next step.
        </p>
        <div className="sidebar-footer">
          <div className="mini-brand-mark">c.</div>
          <div>
            <strong>Choivia</strong>
            <span>Your personal guide</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

function Topbar() {
  const { pathname } = useLocation()
  let section = 'OVERVIEW'

  if (pathname.startsWith('/guide/')) section = 'YOUR GUIDES'
  else if (pathname === '/guides') section = 'YOUR GUIDES'
  else if (pathname === '/progress') section = 'YOUR PROGRESS'
  else if (pathname === '/profile') section = 'YOUR PREFERENCES'

  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span>CHOIVIA</span>
        <span className="breadcrumb-divider">/</span>
        <span className="breadcrumb-current">{section}</span>
      </div>
      <Link to="/profile" className="topbar-profile">
        <Settings2 size={17} />
        <span>Preferences</span>
      </Link>
    </header>
  )
}

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action}
    </div>
  )
}

function GuideCard({ guide, completedIds = [] }) {
  const Icon = guide.icon
  const progress = getProgress(guide, completedIds)

  return (
    <Link to={`/guide/${guide.id}`} className="guide-card">
      <div className="guide-card-top">
        <span className={`guide-icon ${guide.tone}`}><Icon size={20} strokeWidth={1.7} /></span>
        <span className="card-arrow"><ArrowUpRight size={18} /></span>
      </div>
      <p className="guide-category">{guide.category}</p>
      <h3>{guide.title}</h3>
      <p className="guide-summary">{guide.summary}</p>
      <div className="guide-card-progress">
        <div className="progress-label">
          <span>{progress.done} of {progress.total} required steps</span>
          <strong>{progress.percent}%</strong>
        </div>
        <ProgressBar percent={progress.percent} />
      </div>
    </Link>
  )
}

function Dashboard({ completed }) {
  const featured = guides[0]
  const featuredProgress = getProgress(featured, completed[featured.id] || [])
  const totalRequired = guides.reduce(
    (sum, guide) => sum + getProgress(guide, completed[guide.id] || []).total,
    0,
  )
  const totalDone = guides.reduce(
    (sum, guide) => sum + getProgress(guide, completed[guide.id] || []).done,
    0,
  )
  const started = guides.filter((guide) => (completed[guide.id] || []).length > 0).length

  return (
    <>
      <PageHeading
        eyebrow="YOUR PERSONAL GUIDE"
        title={<>A clearer path to <em>what’s next.</em></>}
        description="Bring the steps, details and progress of your next goal into one calm space."
        action={
          <Link className="button button-light" to="/guides">
            Explore guides <ArrowRight size={16} />
          </Link>
        }
      />

      <section className="hero-card">
        <div className="hero-copy">
          <div className="hero-kicker"><Sparkles size={14} /> PICK UP WHERE YOU LEFT OFF</div>
          <h2>Every big thing<br />starts with <em>one step.</em></h2>
          <p>Continue your internship application and keep your next move within reach.</p>
          <Link className="hero-button" to={`/guide/${featured.id}`}>
            Continue guide <ArrowRight size={17} />
          </Link>
          <div className="hero-meta">
            <span><Check size={14} /> {featuredProgress.done} steps complete</span>
            <span className="meta-dot">·</span>
            <span>{featuredProgress.total - featuredProgress.done} required steps to go</span>
          </div>
        </div>
        <div className="hero-visual" aria-label={`${featuredProgress.percent}% complete`}>
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-orbit orbit-three" />
          <div className="hero-center">
            <span className="hero-percent">{featuredProgress.percent}%</span>
            <span className="hero-percent-label">COMPLETED</span>
          </div>
          <span className="orbit-sparkle sparkle-one"><Sparkles size={19} /></span>
          <span className="orbit-sparkle sparkle-two"><Check size={17} /></span>
        </div>
        <div className="hero-index">01 <span>/ 04</span></div>
      </section>

      <section className="overview-strip" aria-label="Your overview">
        <div className="overview-item">
          <span className="overview-icon"><ListChecks size={18} /></span>
          <div><strong>{guides.length}</strong><span>Available guides</span></div>
        </div>
        <div className="overview-item">
          <span className="overview-icon"><CheckCircle2 size={18} /></span>
          <div><strong>{totalDone}<small> / {totalRequired}</small></strong><span>Required steps done</span></div>
        </div>
        <div className="overview-item">
          <span className="overview-icon"><BookOpen size={18} /></span>
          <div><strong>{started}</strong><span>Guides in progress</span></div>
        </div>
      </section>

      <section className="guides-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">MAKE YOUR NEXT MOVE</p>
            <h2>Your guides</h2>
          </div>
          <Link className="text-link" to="/guides">View all guides <ArrowRight size={15} /></Link>
        </div>
        <div className="guide-grid">
          {guides.map((guide) => (
            <GuideCard key={guide.id} guide={guide} completedIds={completed[guide.id] || []} />
          ))}
        </div>
      </section>

      <footer className="page-footer">
        <span>Make progress at your own pace.</span>
        <span className="footer-mark">CHOIVIA <span>©</span></span>
      </footer>
    </>
  )
}

function GuidesPage({ completed }) {
  return (
    <>
      <PageHeading
        eyebrow="YOUR LIBRARY"
        title={<>Find your next <em>step.</em></>}
        description="Choose a guide to turn a multi-step process into a manageable plan."
      />
      <div className="guide-grid guide-grid-page">
        {guides.map((guide) => (
          <GuideCard key={guide.id} guide={guide} completedIds={completed[guide.id] || []} />
        ))}
      </div>
    </>
  )
}

function ProgressPage({ completed, onExport, onImport, onClear, dataMessage }) {
  const totalRequired = guides.reduce(
    (sum, guide) => sum + getProgress(guide, completed[guide.id] || []).total,
    0,
  )
  const totalDone = guides.reduce(
    (sum, guide) => sum + getProgress(guide, completed[guide.id] || []).done,
    0,
  )
  const percentage = totalRequired ? Math.round((totalDone / totalRequired) * 100) : 0

  return (
    <>
      <PageHeading
        eyebrow="EVERY STEP COUNTS"
        title={<>Your progress, <em>at a glance.</em></>}
        description="See what you’ve completed and where you can continue."
      />
      <section className="data-management" aria-label="Saved data management">
        <div className="data-actions">
          <button className="button button-light" type="button" onClick={onExport}>
            <Download size={16} /> Export backup
          </button>
          <label className="button button-light import-button">
            <Upload size={16} /> Import backup
            <input
              type="file"
              accept=".json,application/json"
              aria-label="Import a Choivia JSON backup"
              onChange={onImport}
            />
          </label>
          <button className="button button-danger" type="button" onClick={onClear}>
            <Trash2 size={16} /> Clear all data
          </button>
        </div>
        {dataMessage && (
          <p className="data-message" role="status" aria-live="polite">
            {dataMessage}
          </p>
        )}
      </section>
      <section className="progress-summary-card">
        <div>
          <p className="eyebrow">OVERALL PROGRESS</p>
          <div className="big-progress-number">{percentage}<span>%</span></div>
          <p className="muted-copy">{totalDone} of {totalRequired} required steps completed across all guides.</p>
        </div>
        <div className="summary-progress-visual">
          <div className="summary-progress-ring" style={{ '--progress': `${percentage}%` }}>
            <div><CheckCircle2 size={27} /><span>{percentage}%</span></div>
          </div>
        </div>
      </section>
      <div className="section-heading progress-list-heading">
        <div><p className="eyebrow">YOUR ACTIVITY</p><h2>Guide-by-guide</h2></div>
      </div>
      <div className="progress-list">
        {guides.map((guide) => {
          const progress = getProgress(guide, completed[guide.id] || [])
          const Icon = guide.icon
          return (
            <Link to={`/guide/${guide.id}`} className="progress-row" key={guide.id}>
              <span className={`guide-icon ${guide.tone}`}><Icon size={19} /></span>
              <span className="progress-row-title"><strong>{guide.title}</strong><small>{progress.done} of {progress.total} required steps</small></span>
              <span className="progress-row-bar"><ProgressBar percent={progress.percent} /></span>
              <strong className="progress-row-percent">{progress.percent}%</strong>
              <ChevronRight size={18} className="progress-chevron" />
            </Link>
          )
        })}
      </div>
    </>
  )
}

function ProfilePage({ preferences, updatePreference, questionnaire }) {
  return (
    <>
      <PageHeading
        eyebrow="MAKE IT YOURS"
        title={<>A workspace that <em>fits you.</em></>}
        description="Adjust how Choivia presents information. You can change these settings whenever you need to."
      />
      <section className="quiz-promo">
        <div className="quiz-promo-copy">
          <p className="eyebrow">WORK-PREFERENCE QUESTIONNAIRE</p>
          <h2>Personalize how you work.</h2>
          <p>Answer six quick questions to get suggested settings. You can edit every setting afterwards.</p>
        </div>
        <div className="quiz-promo-actions">
          <Link className="button button-light" to="/preferences-quiz">
            {questionnaire ? 'Retake the quiz' : 'Take the 6-question quiz'}
            <ArrowRight size={16} />
          </Link>
          {questionnaire && (
            <Link className="text-link" to="/preferences-result">
              View my results <ArrowRight size={15} />
            </Link>
          )}
        </div>
      </section>

      <section className="preferences-card">
        <div className="preference-heading">
          <span className="guide-icon sage"><Settings2 size={20} /></span>
          <div><h2>Display preferences</h2><p>Small changes can make a process feel easier to manage.</p></div>
        </div>

        <label className="preference-control">
          <span><strong>Explanation level</strong><small>Choose how much detail you see in each step.</small></span>
          <select value={preferences.explanation} onChange={(event) => updatePreference('explanation', event.target.value)}>
            <option value="medium">Balanced explanations</option>
            <option value="detailed">Detailed explanations</option>
            <option value="concise">Concise instructions</option>
          </select>
        </label>

        <label className="preference-control">
          <span><strong>Checklist layout</strong><small>Choose between a full overview and one step at a time.</small></span>
          <select value={preferences.layout} onChange={(event) => updatePreference('layout', event.target.value)}>
            <option value="overview">Full overview</option>
            <option value="sequential">One step at a time</option>
          </select>
        </label>

        <label className="preference-control preference-toggle">
          <span><strong>Helpful reminders</strong><small>Show gentle notes when a step may depend on another.</small></span>
          <input
            type="checkbox"
            checked={preferences.reminders}
            onChange={(event) => updatePreference('reminders', event.target.checked)}
          />
        </label>

        <div className="privacy-note">
          <CheckCircle2 size={17} />
          <p><strong>Your preferences stay yours.</strong> Settings and guide progress are saved in this browser on this device.</p>
        </div>
      </section>
    </>
  )
}

function GuideDetail({ completed, toggleStep, resetGuide, preferences }) {
  const { guideId } = useParams()
  const guide = guides.find((item) => item.id === guideId)

  if (!guide) {
    return (
      <div className="empty-state">
        <h2>We couldn’t find that guide.</h2>
        <Link className="button button-light" to="/guides">Back to all guides</Link>
      </div>
    )
  }

  const completedIds = completed[guide.id] || []
  const progress = getProgress(guide, completedIds)
  const isDone = progress.percent === 100
  const visibleSteps = preferences.layout === 'sequential'
    ? guide.steps.filter((step) => !completedIds.includes(step.id) || step.required === false).slice(0, 1)
    : guide.steps

  return (
    <>
      <Link className="back-link" to="/guides"><ChevronRight size={16} className="back-chevron" /> All guides</Link>
      <div className="detail-heading">
        <span className={`guide-icon detail-icon ${guide.tone}`}><guide.icon size={25} strokeWidth={1.7} /></span>
        <div>
          <p className="eyebrow">{guide.category} · {guide.duration}</p>
          <h1>{guide.title}</h1>
          <p className="page-description">{guide.summary}</p>
        </div>
      </div>

      <section className="detail-progress-card">
        <div className="detail-progress-top">
          <div><p className="eyebrow">YOUR PROGRESS</p><strong>{progress.done} <span>/ {progress.total} required steps</span></strong></div>
          <span className="detail-percent">{progress.percent}%</span>
        </div>
        <ProgressBar percent={progress.percent} />
        {isDone && <p className="completion-message"><CheckCircle2 size={16} /> All required steps are complete. Nice work!</p>}
      </section>

      {preferences.layout === 'sequential' && (
        <>
          <p className="layout-note">Showing the next unfinished step in your preferred sequential layout.</p>
          {guide.id === 'jobs' && (
            <section className="job-comparison-promo">
              <span className="job-comparison-promo-icon"><Sparkles size={21} /></span>
              <div className="job-comparison-promo-copy">
                <p className="eyebrow">DECISION SUPPORT</p>
                <h2>Considering two opportunities?</h2>
                <p>Compare two job options against your own priorities before deciding what to pursue.</p>
              </div>
              <Link className="button button-light" to="/compare-jobs">
                Compare opportunities <ArrowRight size={16} />
              </Link>
            </section>
          )}
        </>
    )}

      <div className="detail-list-heading">
        <div><p className="eyebrow">YOUR ACTION PLAN</p><h2>Work through the steps</h2></div>
        <button className="subtle-button" onClick={() => resetGuide(guide.id)}><RotateCcw size={15} /> Reset guide</button>
      </div>

      <section className="steps-list">
        {visibleSteps.map((step) => {
          const isComplete = completedIds.includes(step.id)
          const missingDependencies = (step.dependsOn || []).filter((id) => !completedIds.includes(id))
          return (
            <article className={`step-card${isComplete ? ' step-complete' : ''}`} key={step.id}>
              <label className="step-checkbox-wrap">
                <input
                  type="checkbox"
                  checked={isComplete}
                  onChange={() => toggleStep(guide.id, step.id)}
                  aria-label={`${isComplete ? 'Mark incomplete' : 'Mark complete'}: ${step.title}`}
                />
                <span className="custom-checkbox">{isComplete && <Check size={15} />}</span>
              </label>
              <div className="step-number">{String(guide.steps.indexOf(step) + 1).padStart(2, '0')}</div>
              <div className="step-content">
                <div className="step-title-line">
                  <h3>{step.title}</h3>
                  <span className={`step-tag ${step.required === false ? 'optional-tag' : ''}`}>
                    {step.required === false ? 'Optional' : 'Required'}
                  </span>
                </div>
                <p>{preferences.explanation === 'concise' ? step.title : step.description}</p>
                {preferences.explanation === 'detailed' && (
                  <p className="step-details">
                    {step.details || detailedGuidance[step.id] || 'Review this step carefully and confirm any requirements with the relevant official source.'}
                  </p>
                )}
                {preferences.reminders && missingDependencies.length > 0 && (
                  <div className="dependency-note">
                    <Sparkles size={15} />
                    <span>This step may be easier after you complete: {missingDependencies.map((id) => guide.steps.find((item) => item.id === id)?.title).filter(Boolean).join(', ')}. You can still continue.</span>
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </section>

      <section className="review-card">
        <div className="review-icon"><CheckCircle2 size={20} /></div>
        <div className="review-copy">
          <h3>Final review</h3>
          <p>{isDone ? 'You have marked every required step as complete.' : `${progress.total - progress.done} required ${progress.total - progress.done === 1 ? 'step remains' : 'steps remain'} before you finish this guide.`}</p>
          <span>Always verify requirements with the relevant official source.</span>
        </div>
      </section>
    </>
  )
}

function App() {
  const navigate = useNavigate()
  const [savedState, setSavedState] = useState(loadSavedState)
  const [dataMessage, setDataMessage] = useState('')
  const { completed, preferences, questionnaire } = savedState

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...savedState }))
    } catch {
      // The app remains usable if browser storage is unavailable.
    }
  }, [savedState])

  function toggleStep(guideId, stepId) {
    setSavedState((previous) => {
      const current = previous.completed[guideId] || []
      const next = current.includes(stepId)
        ? current.filter((id) => id !== stepId)
        : [...current, stepId]

      return {
        ...previous,
        completed: { ...previous.completed, [guideId]: next },
      }
    })
  }

  function updatePreference(key, value) {
    setSavedState((previous) => ({
      ...previous,
      preferences: { ...previous.preferences, [key]: value },
    }))
  }

  function resetGuide(guideId) {
    if (!window.confirm('Reset this guide? Its completed steps will be cleared.')) return
    setSavedState((previous) => ({
      ...previous,
      completed: { ...previous.completed, [guideId]: [] },
    }))
  }


  function completeQuestionnaire(answers) {
    const nextPreferences = buildPreferencesFromAnswers(answers)

    setSavedState((previous) => ({
      ...previous,
      preferences: nextPreferences,
      questionnaire: {
        answers,
        completedAt: new Date().toISOString(),
      },
    }))

    setDataMessage('')
    navigate('/preferences-result')
  }

  function exportData() {
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      completed,
      preferences,
      questionnaire: savedState.questionnaire ?? null,
    }

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `choivia-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setDataMessage('Your Choivia backup has been downloaded.')
  }

  async function importData(event) {
    const input = event.currentTarget
    const file = input.files?.[0]
    input.value = ''
    if (!file) return

    try {
      const backup = JSON.parse(await file.text())

      if (
        backup?.version !== 1 ||
        !backup.completed ||
        typeof backup.completed !== 'object' ||
        Array.isArray(backup.completed) ||
        !backup.preferences ||
        typeof backup.preferences !== 'object'
      ) {
        throw new Error('Unsupported backup format.')
      }

      const importedCompleted = {}

      for (const guide of guides) {
        const ids = backup.completed[guide.id]

        if (
          !Array.isArray(ids) ||
          ids.some(
            (id) =>
              typeof id !== 'string' ||
              !guide.steps.some((step) => step.id === id),
          )
        ) {
          throw new Error('Invalid guide progress.')
        }

        importedCompleted[guide.id] = [...new Set(ids)]
      }

      const p = backup.preferences

      if (
        !['detailed', 'medium', 'concise'].includes(p.explanation) ||
        !['overview', 'sequential'].includes(p.layout) ||
        typeof p.reminders !== 'boolean'
      ) {
        throw new Error('Invalid preferences.')
      }

      if (!window.confirm('Import this backup? Your current progress and preferences will be replaced.')) {
        setDataMessage('Import canceled. Your saved data was not changed.')
        return
      }

      setSavedState({
        completed: importedCompleted,
        preferences: {
          explanation: p.explanation,
          layout: p.layout,
          reminders: p.reminders,
        },
        questionnaire: backup.questionnaire ?? null,
      })

      setDataMessage('Backup imported successfully.')
    } catch {
      setDataMessage(
        'Import failed. Choose a valid Choivia JSON backup. Your current data was not changed.',
      )
    }
  }

  function clearAllData() {
    if (!window.confirm('Clear all saved guide progress and reset preferences? This cannot be undone.')) {
      return
    }

    setSavedState({
      completed: Object.fromEntries(guides.map((guide) => [guide.id, []])),
      preferences: { ...defaultPreferences },
      questionnaire: null,
    })

    setDataMessage('All saved progress has been cleared and preferences reset.')
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Topbar />
        <main className="page-container">
          <Routes>
            <Route path="/" element={<Dashboard completed={completed} />} />
            <Route path="/guides" element={<GuidesPage completed={completed} />} />
            <Route path="/guide/:guideId" element={<GuideDetail completed={completed} toggleStep={toggleStep} resetGuide={resetGuide} preferences={preferences} />} />
            <Route path="/progress" element={<ProgressPage completed={completed} onExport={exportData} onImport={importData} onClear={clearAllData} dataMessage={dataMessage} />} />
            <Route path="/profile" element={<ProfilePage preferences={preferences} updatePreference={updatePreference} questionnaire={questionnaire} />} />
            <Route path="/preferences-quiz" element={<PreferencesQuiz initialAnswers={questionnaire?.answers} onComplete={completeQuestionnaire} />} />
            <Route path="/preferences-result" element={<PreferencesResult questionnaire={questionnaire} preferences={preferences} />} />
            <Route path="/study" element={<StudyMode updatePreference={updatePreference} questionnaire={questionnaire} />} />
            <Route path="/compare-jobs" element={<JobComparison />} />
            <Route path="*" element={<div className="empty-state"><h2>Page not found</h2><Link to="/" className="text-link">Return to dashboard <ArrowRight size={15} /></Link></div>} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
