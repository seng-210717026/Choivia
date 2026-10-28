import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Equal,
  ExternalLink,
  Scale,
  Sparkles,
} from 'lucide-react'
import {
  calculateJobComparison,
  createInitialComparison,
  JOB_CRITERIA,
} from '../utils/jobComparison.js'
import '../App.css'

const STORAGE_KEY = 'choivia:job-comparison:v1'

const opportunityFields = [
  { id: 'title', label: 'Job title', placeholder: 'e.g. Frontend Developer', type: 'text' },
  { id: 'company', label: 'Company', placeholder: 'Company name', type: 'text' },
  { id: 'salary', label: 'Salary and benefits', placeholder: 'e.g. Monthly range, benefits', type: 'text' },
  { id: 'workMode', label: 'Work arrangement', type: 'select' },
  { id: 'location', label: 'Location', placeholder: 'City or region', type: 'text' },
  { id: 'url', label: 'Job listing URL', placeholder: 'https://...', type: 'url' },
]

const ratingLabels = {
  1: '1 · Poor fit',
  2: '2 · Below expectations',
  3: '3 · Acceptable',
  4: '4 · Good fit',
  5: '5 · Excellent fit',
}

function loadComparison() {
  const initial = createInitialComparison()

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initial

    const parsed = JSON.parse(raw)
    if (parsed?.version !== 1) return initial

    return {
      ...initial,
      ...parsed,
      opportunities: {
        a: {
          ...initial.opportunities.a,
          ...parsed.opportunities?.a,
          ratings: {
            ...initial.opportunities.a.ratings,
            ...parsed.opportunities?.a?.ratings,
          },
        },
        b: {
          ...initial.opportunities.b,
          ...parsed.opportunities?.b,
          ratings: {
            ...initial.opportunities.b.ratings,
            ...parsed.opportunities?.b?.ratings,
          },
        },
      },
      weights: { ...initial.weights, ...parsed.weights },
    }
  } catch {
    return initial
  }
}

function ScoreCard({ label, opportunity, score, percent, highlighted }) {
  return (
    <article className={`job-score-card${highlighted ? ' job-score-highlighted' : ''}`}>
      <span className="job-score-label">{label}</span>
      <h3>{opportunity.title.trim() || 'Untitled opportunity'}</h3>
      <p>{opportunity.company.trim() || 'Company not entered'}</p>
      <div className="job-score-number">
        {score.toFixed(2)}
        <span> / 5</span>
      </div>
      <div className="job-score-track">
        <div className="job-score-fill" style={{ width: `${percent}%` }} />
      </div>
      <span className="job-score-percent">{percent}% of the maximum weighted score</span>
    </article>
  )
}

function JobComparison() {
  const [comparison, setComparison] = useState(loadComparison)
  const [message, setMessage] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comparison))
    } catch (error) {
      console.warn('Could not save the comparison to browser storage.', error)
    }
  }, [comparison])

  const result = calculateJobComparison(comparison)

  function updateOpportunity(optionId, field, value) {
    setComparison((previous) => ({
      ...previous,
      opportunities: {
        ...previous.opportunities,
        [optionId]: {
          ...previous.opportunities[optionId],
          [field]: value,
        },
      },
    }))
    setMessage('')
  }

  function updateRating(optionId, criterionId, value) {
    setComparison((previous) => ({
      ...previous,
      opportunities: {
        ...previous.opportunities,
        [optionId]: {
          ...previous.opportunities[optionId],
          ratings: {
            ...previous.opportunities[optionId].ratings,
            [criterionId]: value,
          },
        },
      },
    }))
    setMessage('')
  }

  function updateWeight(criterionId, value) {
    setComparison((previous) => ({
      ...previous,
      weights: { ...previous.weights, [criterionId]: Number(value) },
    }))
    setMessage('')
  }

  function resetComparison() {
    if (!window.confirm('Clear both opportunities and all comparison ratings?')) return
    setComparison(createInitialComparison())
    setMessage('Comparison cleared.')
  }

  return (
    <div className="job-comparison-page">
      <Link className="back-link" to="/guide/jobs">
        <ArrowLeft size={16} /> Job Application guide
      </Link>

      <header className="job-comparison-heading">
        <span className="job-comparison-mark"><Scale size={22} /></span>
        <p className="eyebrow">DECISION SUPPORT · YOUR PRIORITIES</p>
        <h1>Two opportunities.<br /><em>Your way to compare.</em></h1>
        <p>
          Compare two job opportunities using the things that matter to you.
          You set the priorities, assess each option and remain in control of the decision.
        </p>
      </header>

      <section className="job-comparison-note">
        <Sparkles size={19} />
        <p>
          <strong>A tool for your judgement, not a decision made for you.</strong>
          Use information from the actual listings and your own research. Scores
          summarize your ratings; they do not guarantee job quality or future outcomes.
        </p>
      </section>

      <div className="job-options-grid">
        {[
          { id: 'a', label: 'OPTION A', tone: 'sage' },
          { id: 'b', label: 'OPTION B', tone: 'lilac' },
        ].map((option) => {
          const opportunity = comparison.opportunities[option.id]

          return (
            <section className="job-option-card" key={option.id}>
              <div className="job-option-heading">
                <span className={`job-option-icon ${option.tone}`}>
                  <BriefcaseBusiness size={20} />
                </span>
                <div>
                  <p className="eyebrow">{option.label}</p>
                  <h2>{option.id === 'a' ? 'First opportunity' : 'Second opportunity'}</h2>
                </div>
              </div>

              <div className="job-option-fields">
                {opportunityFields.map((field) => (
                  <label className="job-input-label" key={field.id}>
                    <span>{field.label}</span>
                    {field.type === 'select' ? (
                      <select
                        className="job-field-input"
                        value={opportunity[field.id]}
                        onChange={(event) => updateOpportunity(option.id, field.id, event.target.value)}
                      >
                        <option value="">Choose arrangement</option>
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="On-site">On-site</option>
                        <option value="Flexible">Flexible / not specified</option>
                      </select>
                    ) : (
                      <input
                        className="job-field-input"
                        type={field.type}
                        value={opportunity[field.id]}
                        placeholder={field.placeholder}
                        onChange={(event) => updateOpportunity(option.id, field.id, event.target.value)}
                      />
                    )}
                  </label>
                ))}
              </div>

              {opportunity.url && (
                <a
                  className="job-external-link"
                  href={opportunity.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open listing <ExternalLink size={14} />
                </a>
              )}
            </section>
          )
        })}
      </div>

      <section className="job-ratings-section">
        <div className="job-section-heading">
          <div>
            <p className="eyebrow">YOUR COMPARISON FRAMEWORK</p>
            <h2>What matters most to you?</h2>
            <p>Set the importance of each criterion, then rate both opportunities from 1 to 5.</p>
          </div>
          <span className="job-rating-legend">1 = low · 5 = high</span>
        </div>

        <div className="job-criteria-list">
          {JOB_CRITERIA.map((criterion) => (
            <article className="job-criterion-row" key={criterion.id}>
              <div className="job-criterion-copy">
                <h3>{criterion.title}</h3>
                <p>{criterion.description}</p>
                <label className="job-weight-label">
                  <span>Importance to me</span>
                  <select
                    className="job-weight-select"
                    aria-label={`${criterion.title} importance`}
                    value={comparison.weights[criterion.id]}
                    onChange={(event) => updateWeight(criterion.id, event.target.value)}
                  >
                    <option value="1">1 · Low</option>
                    <option value="2">2 · Somewhat low</option>
                    <option value="3">3 · Medium</option>
                    <option value="4">4 · High</option>
                    <option value="5">5 · Essential</option>
                  </select>
                </label>
              </div>

              <div className="job-rating-inputs">
                {[
                  { id: 'a', label: 'A' },
                  { id: 'b', label: 'B' },
                ].map((option) => (
                  <label className="job-rating-label" key={option.id}>
                    <span>Option {option.label}</span>
                    <select
                      className="job-rating-select"
                      aria-label={`${criterion.title}, option ${option.label} rating`}
                      value={comparison.opportunities[option.id].ratings[criterion.id]}
                      onChange={(event) => updateRating(option.id, criterion.id, event.target.value)}
                    >
                      <option value="">Rate 1–5</option>
                      {Object.entries(ratingLabels).map(([value, label]) => (
                        <option value={value} key={value}>{label}</option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="job-results-section">
        <div className="job-section-heading">
          <div>
            <p className="eyebrow">YOUR RESULTS</p>
            <h2>A clearer side-by-side view</h2>
          </div>
          <span className="job-completion-count">
            {result.ratedCount} / {result.requiredCount} ratings
          </span>
        </div>

        {!result.complete ? (
          <div className="job-results-pending">
            <div className="job-pending-icon"><Scale size={22} /></div>
            <div>
              <h3>Your comparison is taking shape.</h3>
              <p>
                Rate both options across all seven criteria to calculate comparable
                weighted scores. Your entries are saved in this browser as you go.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="job-score-grid">
              <ScoreCard
                label="OPTION A"
                opportunity={comparison.opportunities.a}
                score={result.scoreA}
                percent={result.percentA}
                highlighted={result.leader === 'a'}
              />
              <ScoreCard
                label="OPTION B"
                opportunity={comparison.opportunities.b}
                score={result.scoreB}
                percent={result.percentB}
                highlighted={result.leader === 'b'}
              />
            </div>

            <div className="job-result-explanation">
              {result.leader === 'tie' ? (
                <>
                  <Equal size={19} />
                  <p><strong>Your weighted scores are equal.</strong> Review the criterion-by-criterion differences and consider any factors outside this comparison.</p>
                </>
              ) : (
                <>
                  <CheckCircle2 size={19} />
                  <p>
                    <strong>
                      {result.leader === 'a'
                        ? comparison.opportunities.a.title.trim() || 'Option A'
                        : comparison.opportunities.b.title.trim() || 'Option B'} has the higher weighted score.
                    </strong>
                    This reflects your ratings and importance weights only. It is not an automatic recommendation or a guarantee that the role is right for you.
                  </p>
                </>
              )}
            </div>

            <div className="job-differences">
              <h3>Criterion-by-criterion differences</h3>
              {result.differences.map((difference) => (
                <div className="job-difference-row" key={difference.id}>
                  <div>
                    <strong>{difference.title}</strong>
                    <span>Importance: {difference.weight}/5</span>
                  </div>
                  <div className="job-difference-values">
                    <span>A: {difference.ratingA}</span>
                    <span>B: {difference.ratingB}</span>
                    <strong className={difference.difference > 0
                      ? 'difference-a'
                      : difference.difference < 0
                        ? 'difference-b'
                        : 'difference-equal'}>
                      {difference.difference > 0
                        ? `A +${difference.difference}`
                        : difference.difference < 0
                          ? `B +${Math.abs(difference.difference)}`
                          : 'Equal'}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <div className="job-comparison-footer">
        <p><CheckCircle2 size={15} /> Saved automatically in this browser</p>
        <button className="subtle-button" type="button" onClick={resetComparison}>
          Start a new comparison
        </button>
      </div>

      {message && <p className="job-comparison-message" role="status">{message}</p>}

      <p className="job-comparison-privacy">
        This prototype does not fetch listings or verify employer information.
        Enter only information you are comfortable storing on this device.
      </p>

      <div className="job-next-step">
        <div>
          <p className="eyebrow">READY FOR THE NEXT STEP?</p>
          <h2>Keep your application moving.</h2>
          <p>Once you have weighed your options, return to the job application guide to organise your next actions.</p>
        </div>
        <Link className="quiz-continue" to="/guide/jobs">
          Return to guide <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}

export default JobComparison
