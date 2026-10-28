// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import PreferencesQuiz from './PreferencesQuiz.jsx'

afterEach(() => {
  cleanup()
})

function renderQuiz(props = {}) {
  const user = userEvent.setup()
  const onComplete = props.onComplete ?? vi.fn()

  render(
    <MemoryRouter>
      <PreferencesQuiz {...props} onComplete={onComplete} />
    </MemoryRouter>,
  )

  return { user, onComplete }
}

describe('PreferencesQuiz', () => {
  it('starts at the first of six questions', () => {
    renderQuiz()

    expect(
      screen.getByRole('heading', {
        name: 'When instructions are new to you, what helps most?',
      }),
    ).toBeTruthy()

    expect(
      screen.getByRole('progressbar', {
        name: 'Questionnaire progress',
      }).getAttribute('aria-valuenow'),
    ).toBe('1')
  })

  it('asks the user to select an answer before continuing', async () => {
    const { user } = renderQuiz()

    await user.click(screen.getByRole('button', { name: /^Continue$/ }))

    expect(screen.getByRole('alert').textContent).toContain(
      'Choose an option to continue',
    )
  })

  it('keeps an answer when the user goes back', async () => {
    const { user } = renderQuiz()

    const firstOption = screen.getByRole('button', {
      name: /Give me the full picture/,
    })

    await user.click(firstOption)
    await user.click(screen.getByRole('button', { name: /^Continue$/ }))

    expect(
      screen.getByRole('heading', {
        name: 'When you get stuck, what would you rather see?',
      }),
    ).toBeTruthy()

    await user.click(screen.getByRole('button', { name: /Back/ }))

    expect(
      screen.getByRole('button', {
        name: /Give me the full picture/,
      }).getAttribute('aria-pressed'),
    ).toBe('true')
  })

  it('submits all six answers when the questionnaire is completed', async () => {
    const onComplete = vi.fn()
    const { user } = renderQuiz({ onComplete })

    const answers = [
      'Give me the full picture',
      'A little more guidance',
      'One step at a time',
      'Focus on what comes next',
      'Gentle reminders',
      'Explain the connection',
    ]

    for (let index = 0; index < answers.length; index += 1) {
      await user.click(
        screen.getByRole('button', {
          name: new RegExp(answers[index], 'i'),
        }),
      )

      const nextButton = index === answers.length - 1
        ? screen.getByRole('button', { name: /See my preferences/ })
        : screen.getByRole('button', { name: /^Continue$/ })

      await user.click(nextButton)
    }

    expect(onComplete).toHaveBeenCalledOnce()
    expect(onComplete).toHaveBeenCalledWith({
      instruction_detail: 'detailed',
      help_style: 'detailed',
      task_view: 'sequential',
      progress_view: 'sequential',
      reminder_style: true,
      dependency_notes: true,
    })
  })
})
