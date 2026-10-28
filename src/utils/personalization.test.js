import { describe, expect, it } from 'vitest'
import { buildPreferencesFromAnswers } from './personalization.js'

describe('buildPreferencesFromAnswers', () => {
  it('maps consistent answers to the corresponding preferences', () => {
    const result = buildPreferencesFromAnswers({
      instruction_detail: 'concise',
      help_style: 'concise',
      task_view: 'sequential',
      progress_view: 'sequential',
      reminder_style: false,
      dependency_notes: false,
    })

    expect(result).toEqual({
      explanation: 'concise',
      layout: 'sequential',
      reminders: false,
    })
  })

  it('uses standard defaults when answers conflict', () => {
    const result = buildPreferencesFromAnswers({
      instruction_detail: 'concise',
      help_style: 'detailed',
      task_view: 'sequential',
      progress_view: 'overview',
      reminder_style: false,
      dependency_notes: true,
    })

    expect(result).toEqual({
      explanation: 'detailed',
      layout: 'overview',
      reminders: true,
    })
  })

  it('uses the available answer if only one question is answered', () => {
    const result = buildPreferencesFromAnswers({
      instruction_detail: 'concise',
      task_view: 'sequential',
      reminder_style: false,
    })

    expect(result).toEqual({
      explanation: 'concise',
      layout: 'sequential',
      reminders: false,
    })
  })

  it('returns defaults when no answers are provided', () => {
    expect(buildPreferencesFromAnswers()).toEqual({
      explanation: 'detailed',
      layout: 'overview',
      reminders: true,
    })
  })

  it('does not modify the original answers', () => {
    const answers = {
      instruction_detail: 'detailed',
      help_style: 'detailed',
      task_view: 'overview',
      progress_view: 'overview',
      reminder_style: true,
      dependency_notes: true,
    }
    const original = { ...answers }

    buildPreferencesFromAnswers(answers)

    expect(answers).toEqual(original)
  })
})
