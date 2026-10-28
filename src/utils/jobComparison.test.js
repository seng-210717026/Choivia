import { describe, expect, it } from 'vitest'
import {
  calculateJobComparison,
  createInitialComparison,
  DEFAULT_WEIGHTS,
  JOB_CRITERIA,
} from './jobComparison.js'

function fullyRatedComparison(ratingA, ratingB, weights = DEFAULT_WEIGHTS) {
  const initial = createInitialComparison()

  for (const criterion of JOB_CRITERIA) {
    initial.opportunities.a.ratings[criterion.id] = ratingA
    initial.opportunities.b.ratings[criterion.id] = ratingB
  }

  initial.weights = { ...weights }
  return initial
}

describe('calculateJobComparison', () => {
  it('does not calculate scores until both options are fully rated', () => {
    const result = calculateJobComparison(createInitialComparison())

    expect(result.complete).toBe(false)
    expect(result.scoreA).toBeNull()
    expect(result.ratedCount).toBe(0)
  })

  it('returns equal scores when both options receive identical ratings', () => {
    const result = calculateJobComparison(fullyRatedComparison(4, 4))

    expect(result.complete).toBe(true)
    expect(result.scoreA).toBe(4)
    expect(result.scoreB).toBe(4)
    expect(result.leader).toBe('tie')
  })

  it('identifies the option with the higher weighted score', () => {
    const result = calculateJobComparison(fullyRatedComparison(5, 2))

    expect(result.scoreA).toBe(5)
    expect(result.scoreB).toBe(2)
    expect(result.leader).toBe('a')
    expect(result.percentA).toBe(100)
    expect(result.percentB).toBe(40)
  })

  it('makes higher-importance criteria count more', () => {
    const comparison = fullyRatedComparison(3, 3, DEFAULT_WEIGHTS)
    comparison.opportunities.a.ratings.compensation = 5
    comparison.opportunities.b.ratings.compensation = 1
    comparison.opportunities.a.ratings.commute = 1
    comparison.opportunities.b.ratings.commute = 5

    const result = calculateJobComparison(comparison)
    expect(result.complete).toBe(true)
    expect(result.scoreA).toBeGreaterThan(result.scoreB)
  })

  it('does not mutate the input comparison', () => {
    const comparison = fullyRatedComparison(4, 2)
    const before = JSON.stringify(comparison)

    calculateJobComparison(comparison)

    expect(JSON.stringify(comparison)).toBe(before)
  })

  it('provides all seven comparison criteria', () => {
    expect(JOB_CRITERIA).toHaveLength(7)
  })
})
