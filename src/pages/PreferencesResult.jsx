import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Settings2, Sparkles } from 'lucide-react'
import '../App.css'

const resultDefinitions = [
  {
    key: 'explanation',
    title: 'Explanation level',
    questionIds: ['instruction_detail', 'help_style'],
    labels: {
      detailed: 'Detailed explanations',
      concise: 'Concise instructions',
    },
    reason: {
      detailed: 'Choivia will include fuller descriptions and more context.',
      concise: 'Choivia will keep instructions brief, with details available when useful.',
    },
  },
  {
    key: 'layout',
    title: 'Checklist layout',
    questionIds: ['task_view', 'progress_view'],
    labels: {
      sequential: 'One step at a time',
      overview: 'Full overview',
    },
    reason: {
      sequential: 'Choivia will focus attention on the next unfinished step.',
      overview: 'Choivia will show the checklist as a complete plan.',
    },
  },
  {
    key: 'reminders',
    title: 'Helpful reminders',
    questionIds: ['reminder_style', 'dependency_notes'],
    labels: {
      true: 'Gentle reminders',
      false: 'Minimal reminders',
    },
    reason: {
      true: 'Choivia will show helpful dependency notes and guidance.',
      false: 'Choivia will keep reminder messages to a minimum.',
    },
  },
]

function PreferencesResult({ questionnaire, preferences }) {
  if (!questionnaire?.answers) {
    return (
      <div className="quiz-page">
        <div className="quiz-result-hero">
          <Sparkles size={24} />
          <h1>Your preferences start with you.</h1>
          <p>Complete the short questionnaire to see how your answers map to interface settings.</p>
          <Link className="quiz-continue" to="/preferences-quiz">
            Start questionnaire <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    )
  }

  const answers = questionnaire.answers

  return (
    <div className="quiz-page">
      <div className="quiz-result-hero">
        <span className="quiz-sparkle"><Sparkles size={20} /></span>
        <p className="eyebrow">YOUR PREFERENCES, MADE VISIBLE</p>
        <h1>A setup that works <em>your way.</em></h1>
        <p>
          Your answers have suggested the starting settings below.
          You stay in control, and every setting remains editable.
        </p>
      </div>

      <div className="result-list">
        {resultDefinitions.map((item) => {
          const value = preferences[item.key]
          const first = answers[item.questionIds[0]]
          const second = answers[item.questionIds[1]]
          const conflicted = first !== undefined && second !== undefined && first !== second
          const valueKey = String(value)
          const valueLabel = item.labels[valueKey] ?? 'Standard setting'

          let explanation = item.reason[valueKey]
          if (conflicted) {
            explanation = 'Your answers pointed in different directions, so Choivia used its standard setting as a starting point. You can change it below.'
          }

          return (
            <section className="result-setting" key={item.key}>
              <div className="result-setting-icon"><CheckCircle2 size={19} /></div>
              <div className="result-setting-copy">
                <p className="eyebrow">{item.title}</p>
                <h2>{valueLabel}</h2>
                <p>{explanation}</p>
                {conflicted && <span className="result-standard-note">Standard starting setting</span>}
              </div>
            </section>
          )
        })}
      </div>

      <div className="result-control-note">
        <Settings2 size={19} />
        <p>
          <strong>You are always in control.</strong>
          Change any setting from Preferences whenever your needs change.
          Your answers are not a personality label.
        </p>
      </div>

      <div className="result-actions">
        <Link className="quiz-continue" to="/profile">
          Review my settings <ArrowRight size={16} />
        </Link>
        <Link className="text-link" to="/">
          Return to dashboard
        </Link>
      </div>

      <p className="quiz-privacy">
        These settings are suggestions based on your stated preferences, not a validated psychological assessment.
      </p>
    </div>
  )
}

export default PreferencesResult
