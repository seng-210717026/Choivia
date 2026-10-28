export const JOB_CRITERIA = [
  {
    id: 'roleFit',
    title: 'Role fit',
    description: 'How well does the role match your skills and goals?',
  },
  {
    id: 'learning',
    title: 'Learning and growth',
    description: 'How much could you learn and develop in this role?',
  },
  {
    id: 'compensation',
    title: 'Compensation and benefits',
    description: 'How well do the salary and benefits meet your needs?',
  },
  {
    id: 'workLifeBalance',
    title: 'Work-life balance',
    description: 'How suitable are the expected hours and workload?',
  },
  {
    id: 'workMode',
    title: 'Work arrangement',
    description: 'How well does remote, hybrid or office work fit you?',
  },
  {
    id: 'commute',
    title: 'Commute and location',
    description: 'How manageable is the location and daily travel?',
  },
  {
    id: 'culture',
    title: 'Team and company culture',
    description: 'How well does the team and working environment fit you?',
  },
]

export const DEFAULT_WEIGHTS = {
  roleFit: 4,
  learning: 4,
  compensation: 4,
  workLifeBalance: 4,
  workMode: 3,
  commute: 3,
  culture: 3,
}

function emptyRatings() {
  return Object.fromEntries(JOB_CRITERIA.map((criterion) => [criterion.id, '']))
}

export function createInitialComparison() {
  return {
    version: 1,
    opportunities: {
      a: {
        title: '',
        company: '',
        salary: '',
        workMode: '',
        location: '',
        url: '',
        ratings: emptyRatings(),
      },
      b: {
        title: '',
        company: '',
        salary: '',
        workMode: '',
        location: '',
        url: '',
        ratings: emptyRatings(),
      },
    },
    weights: { ...DEFAULT_WEIGHTS },
  }
}

function isRatingValid(value) {
  return value !== '' &&
    value !== null &&
    value !== undefined &&
    Number.isFinite(Number(value)) &&
    Number(value) >= 1 &&
    Number(value) <= 5
}

export function calculateJobComparison(comparison) {
  const ratedCount = JOB_CRITERIA.reduce((count, criterion) => {
    return count +
      Number(isRatingValid(comparison.opportunities.a.ratings[criterion.id])) +
      Number(isRatingValid(comparison.opportunities.b.ratings[criterion.id]))
  }, 0)

  const requiredCount = JOB_CRITERIA.length * 2

  if (ratedCount !== requiredCount) {
    return {
      complete: false,
      ratedCount,
      requiredCount,
      scoreA: null,
      scoreB: null,
      percentA: null,
      percentB: null,
      leader: null,
      differences: [],
    }
  }

  let weightedTotalA = 0
  let weightedTotalB = 0
  let totalWeight = 0

  const differences = JOB_CRITERIA.map((criterion) => {
    const weight = Number(comparison.weights[criterion.id])
    const ratingA = Number(comparison.opportunities.a.ratings[criterion.id])
    const ratingB = Number(comparison.opportunities.b.ratings[criterion.id])

    if (!Number.isFinite(weight) || weight < 1 || weight > 5) {
      throw new Error(`Invalid importance weight for ${criterion.id}`)
    }

    weightedTotalA += ratingA * weight
    weightedTotalB += ratingB * weight
    totalWeight += weight

    return {
      id: criterion.id,
      title: criterion.title,
      weight,
      ratingA,
      ratingB,
      difference: ratingA - ratingB,
    }
  })

  const scoreA = weightedTotalA / totalWeight
  const scoreB = weightedTotalB / totalWeight
  const difference = scoreA - scoreB

  return {
    complete: true,
    ratedCount,
    requiredCount,
    scoreA: Number(scoreA.toFixed(2)),
    scoreB: Number(scoreB.toFixed(2)),
    percentA: Math.round((scoreA / 5) * 100),
    percentB: Math.round((scoreB / 5) * 100),
    leader: Math.abs(difference) < 0.005
      ? 'tie'
      : difference > 0
        ? 'a'
        : 'b',
    differences,
  }
}
