export const DEFAULT_STUDY_PREFERENCES = {
  explanation: 'medium',
  layout: 'overview',
  reminders: true,
}

export const SUS_ITEMS = [
  'I think that I would like to use this system frequently.',
  'I found the system unnecessarily complex.',
  'I thought the system was easy to use.',
  'I think that I would need the support of a technical person to be able to use this system.',
  'I found the various functions in this system were well integrated.',
  'I thought there was too much inconsistency in this system.',
  'I would imagine that most people would learn to use this system very quickly.',
  'I found the system very cumbersome to use.',
  'I felt very confident using the system.',
  'I needed to learn a lot of things before I could get going with this system.',
]

export function calculateSUSScore(responses = []) {
  if (
    responses.length !== 10 ||
    responses.some(
      (response) =>
        response === '' ||
        response === null ||
        response === undefined ||
        !Number.isInteger(Number(response)) ||
        Number(response) < 1 ||
        Number(response) > 5,
    )
  ) {
    return null
  }

  const adjustedScore = responses.reduce((total, response, index) => {
    const value = Number(response)

    return total + (
      index % 2 === 0
        ? value - 1
        : 5 - value
    )
  }, 0)

  return adjustedScore * 2.5
}

export function getStudyConditionPreferences(condition, personalizedPreferences) {
  if (condition === 'default') {
    return { ...DEFAULT_STUDY_PREFERENCES }
  }

  if (condition === 'personalized' && personalizedPreferences) {
    return { ...personalizedPreferences }
  }

  return null
}
