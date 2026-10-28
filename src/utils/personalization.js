const defaults = {
  explanation: 'detailed',
  layout: 'overview',
  reminders: true,
}

function resolvePair(first, second, fallback) {
  if (first === undefined && second === undefined) {
    return fallback
  }

  if (first === undefined) {
    return second
  }

  if (second === undefined) {
    return first
  }

  return first === second ? first : fallback
}

export function buildPreferencesFromAnswers(answers = {}) {
  return {
    explanation: resolvePair(
      answers.instruction_detail,
      answers.help_style,
      defaults.explanation,
    ),
    layout: resolvePair(
      answers.task_view,
      answers.progress_view,
      defaults.layout,
    ),
    reminders: resolvePair(
      answers.reminder_style,
      answers.dependency_notes,
      defaults.reminders,
    ),
  }
}
