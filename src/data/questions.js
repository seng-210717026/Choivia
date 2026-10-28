export const preferenceQuestions = [
  {
    id: 'instruction_detail',
    setting: 'explanation',
    title: 'When instructions are new to you, what helps most?',
    description: 'Think about how you prefer to understand an unfamiliar task.',
    options: [
      {
        value: 'detailed',
        label: 'Give me the full picture',
        description: 'Context, explanations and helpful examples.',
      },
      {
        value: 'concise',
        label: 'Show me the essentials',
        description: 'Short instructions that get straight to the point.',
      },
    ],
  },
  {
    id: 'help_style',
    setting: 'explanation',
    title: 'When you get stuck, what would you rather see?',
    description: 'Choose the kind of guidance you would find easier to use.',
    options: [
      {
        value: 'detailed',
        label: 'A little more guidance',
        description: 'Extra context to help me understand what to do.',
      },
      {
        value: 'concise',
        label: 'A quick reminder',
        description: 'A brief hint so I can work things out myself.',
      },
    ],
  },
  {
    id: 'task_view',
    setting: 'layout',
    title: 'How do you prefer to approach a multi-step task?',
    description: 'There is no right or wrong way to work.',
    options: [
      {
        value: 'sequential',
        label: 'One step at a time',
        description: 'Keep my attention on the next action.',
      },
      {
        value: 'overview',
        label: 'See all the steps',
        description: 'Understand the entire plan before I begin.',
      },
    ],
  },
  {
    id: 'progress_view',
    setting: 'layout',
    title: 'When reviewing progress, what feels more natural?',
    description: 'Think about how you like to understand what remains.',
    options: [
      {
        value: 'sequential',
        label: 'Focus on what comes next',
        description: 'Review the next unfinished action.',
      },
      {
        value: 'overview',
        label: 'Compare the whole checklist',
        description: 'See completed and remaining steps together.',
      },
    ],
  },
  {
    id: 'reminder_style',
    setting: 'reminders',
    title: 'How would you like Choivia to guide you?',
    description: 'Choose how much proactive guidance you prefer.',
    options: [
      {
        value: true,
        label: 'Gentle reminders',
        description: 'Point out dependencies and useful next steps.',
      },
      {
        value: false,
        label: 'A quieter workspace',
        description: 'Show fewer reminders and keep the interface calm.',
      },
    ],
  },
  {
    id: 'dependency_notes',
    setting: 'reminders',
    title: 'When one step depends on another, what helps you most?',
    description: 'You will always remain free to choose what to do next.',
    options: [
      {
        value: true,
        label: 'Explain the connection',
        description: 'Tell me why another step may be useful first.',
      },
      {
        value: false,
        label: 'Let me manage my own order',
        description: 'Keep these notes minimal unless I need them.',
      },
    ],
  },
]
