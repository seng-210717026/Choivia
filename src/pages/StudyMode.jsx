import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Play,
  RotateCcw,
  ShieldCheck,
  Square,
} from 'lucide-react'
import { buildPreferencesFromAnswers } from '../utils/personalization.js'
import {
  calculateSUSScore,
  getStudyConditionPreferences,
  SUS_ITEMS,
} from '../utils/study.js'
import '../App.css'

const STUDY_KEY = 'choivia:study:v1'

function emptyResult() {
  return {
    timeSeconds: '',
    errors: '0',
    taskOutcome: '',
    recovery: '',
    progressAccuracy: '',
    confidence: '',
    susResponses: Array(10).fill(''),
    notes: '',
  }
}

function initialStudyData() {
  return {
    version: 1,
    participantCode: '',
    order: 'default-first',
    activeCondition: null,
    results: {
      default: emptyResult(),
      personalized: emptyResult(),
    },
  }
}

function loadStudyData() {
  try {
    const saved = localStorage.getItem(STUDY_KEY)
    if (!saved) return initialStudyData()

    const parsed = JSON.parse(saved)
    const initial = initialStudyData()

    return {
      ...initial,
      ...parsed,
      results: {
        default: { ...emptyResult(), ...parsed.results?.default },
        personalized: {
          ...emptyResult(),
          ...parsed.results?.personalized,
        },
      },
    }
  } catch {
    return initialStudyData()
  }
}

const conditions = [
  {
    id: 'default',
    title: 'Default condition',
    label: 'CONDITION A',
    guideId: 'internship',
    guideTitle: 'Internship application',
    description: 'A fixed presentation for every participant.',
    settings: 'Balanced explanations · Full overview · Reminders on',
  },
  {
    id: 'personalized',
    title: 'Personalized condition',
    label: 'CONDITION B',
    guideId: 'courses',
    guideTitle: 'Course registration',
    description: 'Presentation based on the participant’s stated preferences.',
    settings: 'Explanation, layout and reminders from questionnaire answers',
  },
]

const taskInstructions = [
  'Find and open the assigned guide.',
  'Mark at least three steps as complete.',
  'Identify the required steps that remain incomplete.',
  'Mark a step by mistake, then reverse that action.',
  'Return to the guide after navigating away and check whether progress was preserved.',
]

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function StudyMode({ updatePreference, questionnaire }) {
  const [data, setData] = useState(loadStudyData)
  const [consentConfirmed, setConsentConfirmed] = useState(false)
  const [message, setMessage] = useState('')
  const [now, setNow] = useState(0)

  const personalizedPreferences = questionnaire?.answers
    ? buildPreferencesFromAnswers(questionnaire.answers)
    : null

  const activeCondition = data.activeCondition
  const activeResult = activeCondition ? data.results[activeCondition] : null
  const startedAt = activeResult?.startedAt ?? null

  useEffect(() => {
    try {
      localStorage.setItem(STUDY_KEY, JSON.stringify(data))
    } catch {
      // Study data remains usable in memory when storage is unavailable.
    }
  }, [data])

  useEffect(() => {
    if (!startedAt) return undefined

    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [startedAt])

  const elapsed = startedAt
    ? Math.max(0, Math.floor((now - startedAt) / 1000))
    : 0

  function updateData(patch) {
    setData((previous) => ({ ...previous, ...patch }))
  }

  function updateResult(conditionId, patch) {
    setData((previous) => ({
      ...previous,
      results: {
        ...previous.results,
        [conditionId]: {
          ...previous.results[conditionId],
          ...patch,
        },
      },
    }))
  }

  function activateCondition(conditionId) {
    if (!consentConfirmed) {
      setMessage('Confirm that informed consent has been obtained before activating a condition.')
      return
    }

    const nextPreferences = getStudyConditionPreferences(
      conditionId,
      personalizedPreferences,
    )

    if (!nextPreferences) {
      setMessage('Complete the work-preference questionnaire before using the personalized condition.')
      return
    }

    Object.entries(nextPreferences).forEach(([key, value]) => {
      updatePreference(key, value)
    })

    updateData({ activeCondition: conditionId })
    setMessage(
      conditionId === 'default'
        ? 'Default condition activated. The fixed presentation is now applied.'
        : 'Personalized condition activated using the questionnaire answers.',
    )
  }

  function startTimer() {
    if (!activeCondition) return
    if (activeResult?.startedAt) return

    updateResult(activeCondition, { startedAt: Date.now() })
    setMessage('Timer started. Open the assigned guide and begin the task.')
  }

  function stopTimer() {
    if (!activeCondition || !activeResult?.startedAt) return

    const seconds = Math.max(
      0,
      Math.round((Date.now() - activeResult.startedAt) / 1000),
    )

    const nextResult = { ...activeResult }
    delete nextResult.startedAt

    setData((previous) => ({
      ...previous,
      results: {
        ...previous.results,
        [activeCondition]: {
          ...nextResult,
          timeSeconds: String(seconds),
        },
      },
    }))

    setMessage(`Recorded task time: ${seconds} seconds.`)
  }

  function exportStudyData() {
    const payload = {
      project: 'Choivia usability study',
      exportedAt: new Date().toISOString(),
      participantCode: data.participantCode,
      conditionOrder: data.order,
      conditions: Object.fromEntries(
        conditions.map((condition) => {
          const result = data.results[condition.id]
          return [
            condition.id,
            {
              ...result,
              susScore: calculateSUSScore(result.susResponses),
            },
          ]
        }),
      ),
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `choivia-study-${data.participantCode.trim() || 'anonymous'}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMessage('Study record exported as JSON.')
  }

  function resetStudy() {
    if (!window.confirm('Clear this study record? This does not clear ordinary Choivia guide progress.')) {
      return
    }

    setData(initialStudyData())
    setConsentConfirmed(false)
    setMessage('Study record cleared.')
  }

  const orderedConditions = data.order === 'default-first'
    ? conditions
    : [...conditions].reverse()

  return (
    <div className="study-page">
      <div className="study-heading">
        <p className="eyebrow">HCI EVALUATION WORKSPACE</p>
        <h1>Understand how guidance <em>works.</em></h1>
        <p>
          Compare a fixed interface with preference-based presentation.
          Record observations for each condition and export an anonymous study record.
        </p>
      </div>

      <section className="study-notice">
        <ShieldCheck size={21} />
        <div>
          <strong>Privacy and consent</strong>
          <p>
            Use this workspace with participants only after explaining the study and
            obtaining informed consent. Record anonymous participant codes only.
            Do not enter names or sensitive information.
          </p>
        </div>
      </section>

      <section className="study-setup">
        <div>
          <label className="study-label" htmlFor="participant-code">
            ANONYMOUS PARTICIPANT CODE
          </label>
          <input
            id="participant-code"
            className="study-input"
            value={data.participantCode}
            placeholder="e.g. P01"
            maxLength={24}
            onChange={(event) => updateData({
              participantCode: event.target.value.replace(/[^a-zA-Z0-9_-]/g, ''),
            })}
          />
        </div>

        <div>
          <label className="study-label" htmlFor="condition-order">
            CONDITION ORDER
          </label>
          <select
            id="condition-order"
            className="study-input"
            value={data.order}
            onChange={(event) => updateData({ order: event.target.value })}
          >
            <option value="default-first">Default, then personalized</option>
            <option value="personalized-first">Personalized, then default</option>
          </select>
        </div>

        <label className="study-consent">
          <input
            type="checkbox"
            checked={consentConfirmed}
            onChange={(event) => {
              setConsentConfirmed(event.target.checked)
              setMessage('')
            }}
          />
          <span>I confirm that informed consent has been obtained for this session.</span>
        </label>
      </section>

      <div className="study-section-heading">
        <div>
          <p className="eyebrow">WITHIN-SUBJECT COMPARISON</p>
          <h2>Run both conditions</h2>
        </div>
        <span className="study-saved-indicator">
          <CheckCircle2 size={14} /> Saved locally
        </span>
      </div>

      <div className="study-condition-grid">
        {orderedConditions.map((condition, index) => {
          const result = data.results[condition.id]
          const score = calculateSUSScore(result.susResponses)
          const isActive = activeCondition === condition.id

          return (
            <section className={`study-condition${isActive ? ' is-active' : ''}`} key={condition.id}>
              <div className="study-condition-top">
                <span className="study-condition-label">{condition.label}</span>
                <span className="study-order-number">ORDER {index + 1}</span>
              </div>

              <h3>{condition.title}</h3>
              <p className="study-condition-description">{condition.description}</p>

              <div className="study-settings-summary">{condition.settings}</div>

              {condition.id === 'personalized' && !questionnaire?.answers && (
                <div className="study-missing-quiz">
                  <p>Complete the preference questionnaire first.</p>
                  <Link to="/preferences-quiz" className="text-link">
                    Open questionnaire <ArrowRight size={14} />
                  </Link>
                </div>
              )}

              <button
                className={isActive ? 'study-active-button' : 'quiz-continue'}
                type="button"
                onClick={() => activateCondition(condition.id)}
              >
                {isActive ? 'Condition active' : 'Activate condition'}
                {isActive ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />}
              </button>

              <div className="study-task-block">
                <p className="study-label">ASSIGNED GUIDE</p>
                <strong>{condition.guideTitle}</strong>
                <Link
                  className="text-link"
                  to={`/guide/${condition.guideId}`}
                  onClick={(event) => {
                    if (!isActive) {
                      event.preventDefault()
                      setMessage('Activate this condition before opening its assigned guide.')
                    }
                  }}
                >
                  Open guide and perform tasks <ArrowRight size={14} />
                </Link>
                <ol className="study-task-list">
                  {taskInstructions.map((task) => <li key={task}>{task}</li>)}
                </ol>
              </div>

              <div className="study-timer">
                <div>
                  <span className="study-label">TASK TIMER</span>
                  <strong>
                    {isActive && result.startedAt
                      ? formatTime(elapsed)
                      : result.timeSeconds !== ''
                        ? formatTime(Number(result.timeSeconds))
                        : '00:00'}
                  </strong>
                </div>
                {isActive && result.startedAt ? (
                  <button type="button" className="subtle-button" onClick={stopTimer}>
                    <Square size={14} /> Stop and record
                  </button>
                ) : (
                  <button
                    type="button"
                    className="subtle-button"
                    disabled={!isActive}
                    onClick={startTimer}
                  >
                    <Play size={14} /> Start timer
                  </button>
                )}
              </div>

              <div className="study-measures">
                <p className="eyebrow">OBSERVER RECORD</p>

                <label>
                  <span>Task outcome</span>
                  <select
                    className="study-input"
                    value={result.taskOutcome}
                    onChange={(event) => updateResult(condition.id, { taskOutcome: event.target.value })}
                  >
                    <option value="">Not recorded</option>
                    <option value="success">Success without help</option>
                    <option value="with-help">Success with help</option>
                    <option value="failure">Failure</option>
                  </select>
                </label>

                <label>
                  <span>Time on task (seconds)</span>
                  <input
                    className="study-input"
                    type="number"
                    min="0"
                    value={result.timeSeconds}
                    onChange={(event) => updateResult(condition.id, { timeSeconds: event.target.value })}
                    placeholder="Recorded by timer or observer"
                  />
                </label>

                <label>
                  <span>Number of errors</span>
                  <input
                    className="study-input"
                    type="number"
                    min="0"
                    step="1"
                    value={result.errors}
                    onChange={(event) => updateResult(condition.id, { errors: event.target.value })}
                  />
                </label>

                <label>
                  <span>Could the participant reverse a mistake?</span>
                  <select
                    className="study-input"
                    value={result.recovery}
                    onChange={(event) => updateResult(condition.id, { recovery: event.target.value })}
                  >
                    <option value="">Not recorded</option>
                    <option value="yes">Yes, independently</option>
                    <option value="with-help">Yes, with help</option>
                    <option value="no">No</option>
                    <option value="not-applicable">Not observed</option>
                  </select>
                </label>

                <label>
                  <span>Progress identification</span>
                  <select
                    className="study-input"
                    value={result.progressAccuracy}
                    onChange={(event) => updateResult(condition.id, { progressAccuracy: event.target.value })}
                  >
                    <option value="">Not recorded</option>
                    <option value="correct">Correct</option>
                    <option value="incorrect">Incorrect</option>
                  </select>
                </label>

                <label>
                  <span>Confidence rating (1–7)</span>
                  <select
                    className="study-input"
                    value={result.confidence}
                    onChange={(event) => updateResult(condition.id, { confidence: event.target.value })}
                  >
                    <option value="">Not recorded</option>
                    {[1, 2, 3, 4, 5, 6, 7].map((rating) => (
                      <option key={rating} value={rating}>{rating}</option>
                    ))}
                  </select>
                </label>

                <details className="study-sus">
                  <summary>System Usability Scale (SUS)</summary>
                  <p className="study-sus-intro">
                    Answer after the participant has used this condition. Use the same
                    five-point response scale for each statement.
                  </p>
                  {SUS_ITEMS.map((item, itemIndex) => (
                    <label className="study-sus-item" key={item}>
                      <span>{itemIndex + 1}. {item}</span>
                      <select
                        className="study-input"
                        aria-label={`SUS item ${itemIndex + 1}`}
                        value={result.susResponses[itemIndex]}
                        onChange={(event) => {
                          const responses = [...result.susResponses]
                          responses[itemIndex] = event.target.value
                          updateResult(condition.id, { susResponses: responses })
                        }}
                      >
                        <option value="">Choose rating</option>
                        <option value="1">1 — Strongly disagree</option>
                        <option value="2">2 — Disagree</option>
                        <option value="3">3 — Neutral</option>
                        <option value="4">4 — Agree</option>
                        <option value="5">5 — Strongly agree</option>
                      </select>
                    </label>
                  ))}
                  <div className="study-sus-score">
                    <span>Calculated SUS score</span>
                    <strong>{score === null ? 'Complete all 10 items' : `${score.toFixed(1)} / 100`}</strong>
                  </div>
                </details>

                <label>
                  <span>Qualitative observations (no identifying details)</span>
                  <textarea
                    className="study-input study-textarea"
                    rows={3}
                    value={result.notes}
                    onChange={(event) => updateResult(condition.id, { notes: event.target.value })}
                    placeholder="Hesitation, confusion, useful feedback..."
                  />
                </label>
              </div>
            </section>
          )
        })}
      </div>

      <div className="study-actions">
        <button type="button" className="button button-light" onClick={exportStudyData}>
          <Download size={16} /> Export study record
        </button>
        <button type="button" className="subtle-button" onClick={resetStudy}>
          <RotateCcw size={15} /> Clear study record
        </button>
      </div>

      {message && <p className="study-message" role="status" aria-live="polite">{message}</p>}

      <div className="study-footnote">
        <ClipboardCheck size={17} />
        <p>
          <strong>Research reminder:</strong> Counterbalance condition order across
          participants. Treat results from a small sample descriptively, not as proof
          that personalization works for everyone.
        </p>
      </div>
    </div>
  )
}

export default StudyMode
