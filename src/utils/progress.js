export function getProgress(guide, completedIds = []) {
  const requiredSteps = guide.steps.filter(
    (step) => step.required !== false,
  )

  const done = requiredSteps.filter(
    (step) => completedIds.includes(step.id),
  ).length

  return {
    done,
    total: requiredSteps.length,
    percent: requiredSteps.length
      ? Math.round((done / requiredSteps.length) * 100)
      : 0,
  }
}

export function toggleCompletedStep(completedIds, stepId) {
  return completedIds.includes(stepId)
    ? completedIds.filter((id) => id !== stepId)
    : [...completedIds, stepId]
}
