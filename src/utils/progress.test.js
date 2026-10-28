import { describe, expect, it } from 'vitest'
import { getProgress, toggleCompletedStep } from './progress.js'

describe('getProgress', () => {
  const guide = {
    steps: [
      { id: 'step-1' },
      { id: 'step-2' },
      { id: 'step-3' },
      { id: 'optional-step', required: false },
    ],
  }

  it('calculates progress from required steps only', () => {
    const result = getProgress(guide, ['step-1'])

    expect(result).toEqual({
      done: 1,
      total: 3,
      percent: 33,
    })
  })

  it('does not count optional steps towards progress', () => {
    const result = getProgress(guide, [
      'step-1',
      'optional-step',
    ])

    expect(result).toEqual({
      done: 1,
      total: 3,
      percent: 33,
    })
  })

  it('returns zero progress for an empty guide', () => {
    expect(getProgress({ steps: [] })).toEqual({
      done: 0,
      total: 0,
      percent: 0,
    })
  })

  it('returns zero when a guide has only optional steps', () => {
    const optionalGuide = {
      steps: [{ id: 'optional-1', required: false }],
    }

    expect(getProgress(optionalGuide, ['optional-1'])).toEqual({
      done: 0,
      total: 0,
      percent: 0,
    })
  })

  it('returns 100 percent when all required steps are complete', () => {
    const result = getProgress(guide, [
      'step-1',
      'step-2',
      'step-3',
    ])

    expect(result.percent).toBe(100)
  })
})

describe('toggleCompletedStep', () => {
  it('adds an incomplete step', () => {
    expect(toggleCompletedStep(['step-1'], 'step-2')).toEqual([
      'step-1',
      'step-2',
    ])
  })

  it('removes a completed step when toggled again', () => {
    expect(toggleCompletedStep(['step-1', 'step-2'], 'step-1')).toEqual([
      'step-2',
    ])
  })

  it('does not mutate the original array', () => {
    const original = ['step-1']

    toggleCompletedStep(original, 'step-2')

    expect(original).toEqual(['step-1'])
  })
})
