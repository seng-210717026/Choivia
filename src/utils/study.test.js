import { describe, expect, it } from 'vitest'
import {
  calculateSUSScore,
  DEFAULT_STUDY_PREFERENCES,
  getStudyConditionPreferences,
} from './study.js'

describe('calculateSUSScore', () => {
  it('calculates a score of 100 for all positive responses', () => {
    expect(calculateSUSScore([5, 1, 5, 1, 5, 1, 5, 1, 5, 1])).toBe(100)
  })

  it('calculates a score of zero for the lowest responses', () => {
    expect(calculateSUSScore([1, 5, 1, 5, 1, 5, 1, 5, 1, 5])).toBe(0)
  })

  it('does not calculate a score for incomplete responses', () => {
    expect(calculateSUSScore([5, 4, 3])).toBeNull()
  })

  it('rejects responses outside the 1 to 5 range', () => {
    expect(calculateSUSScore([6, 1, 5, 1, 5, 1, 5, 1, 5, 1])).toBeNull()
  })
})

describe('getStudyConditionPreferences', () => {
  it('returns the fixed settings for the default condition', () => {
    expect(getStudyConditionPreferences('default')).toEqual(
      DEFAULT_STUDY_PREFERENCES,
    )
  })

  it('returns participant preferences for the personalized condition', () => {
    const preferences = {
      explanation: 'concise',
      layout: 'sequential',
      reminders: false,
    }

    expect(getStudyConditionPreferences('personalized', preferences)).toEqual(
      preferences,
    )
  })

  it('does not invent personalized settings when no questionnaire is available', () => {
    expect(getStudyConditionPreferences('personalized', null)).toBeNull()
  })
})
