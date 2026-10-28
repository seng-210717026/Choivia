import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react'
import { preferenceQuestions } from '../data/questions.js'
import '../App.css'

function PreferencesQuiz({ initialAnswers = {}, onComplete }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState(initialAnswers)
  const [error, setError] = useState('')

  const question = preferenceQuestions[step]
  const selected = answers[question.id]
  const isLast = step === preferenceQuestions.length - 1
  const progress = Math.round(((step + 1) / preferenceQuestions.length) * 100)

  function selectOption(value) {
    setAnswers((previous) => ({
      ...previous,
      [question.id]: value,
    }))
    setError('')
  }

  function continueQuiz() {
    if (selected === undefined) {
      setError('Choose an option to continue, or skip the questionnaire.')
      return
    }

    if (isLast) {
      onComplete(answers)
      return
    }

    setStep((previous) => previous + 1)
    setError('')
  }

  return (
    <div className="quiz-page">
      <Link to="/profile" className="back-link">
        <ArrowLeft size={16} /> Preferences
      </Link>

      <div className="quiz-intro">
        <span className="quiz-sparkle"><Sparkles size={18} /></span>
        <p className="eyebrow">A WORKSPACE THAT FITS YOU</p>
        <h1>Let’s find your <em>working rhythm.</em></h1>
        <p>
          Six quick questions help Choivia adapt how it presents your tasks.
          There are no right or wrong answers.
        </p>
      </div>

      <section className="quiz-card" aria-labelledby="quiz-question-title">
        <div className="quiz-progress-heading">
          <span>YOUR PREFERENCES</span>
          <span>QUESTION {step + 1} OF {preferenceQuestions.length}</span>
        </div>

        <div
          className="quiz-progress-track"
          role="progressbar"
          aria-label="Questionnaire progress"
          aria-valuemin={0}
          aria-valuemax={preferenceQuestions.length}
          aria-valuenow={step + 1}
        >
          <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="quiz-question">
          <h2 id="quiz-question-title">{question.title}</h2>
          <p>{question.description}</p>
        </div>

        <div className="quiz-options" role="group" aria-label="Answer options">
          {question.options.map((option) => {
            const isSelected = selected === option.value

            return (
              <button
                type="button"
                key={String(option.value)}
                className={`quiz-option${isSelected ? ' selected' : ''}`}
                aria-pressed={isSelected}
                onClick={() => selectOption(option.value)}
              >
                <span className="quiz-option-indicator">
                  {isSelected && <Check size={15} />}
                </span>
                <span className="quiz-option-copy">
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </span>
                <ArrowRight className="quiz-option-arrow" size={17} />
              </button>
            )
          })}
        </div>

        {error && <p className="quiz-error" role="alert">{error}</p>}

        <div className="quiz-controls">
          <button
            className="subtle-button"
            type="button"
            disabled={step === 0}
            onClick={() => {
              setStep((previous) => previous - 1)
              setError('')
            }}
          >
            <ArrowLeft size={15} /> Back
          </button>

          <button className="quiz-continue" type="button" onClick={continueQuiz}>
            {isLast ? 'See my preferences' : 'Continue'}
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <div className="quiz-bottom">
        <span><Check size={14} /> Editable at any time</span>
        <Link to="/profile">Skip for now</Link>
      </div>

      <p className="quiz-privacy">
        This is a work-preference questionnaire, not a personality or clinical assessment.
        Your answers are saved in this browser only.
      </p>
    </div>
  )
}

export default PreferencesQuiz
