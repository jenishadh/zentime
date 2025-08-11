const config = {
  endOfLine: 'lf',
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'none',
  printWidth: 100,
  arrowParens: 'always',
  importOrder: [
    // 1. Core Frameworks (React, Next.js)
    '^react$',
    '^react/(.*)$',
    '^next$',
    '^next/(.*)$',
    '',

    // 2. Third-Party Libraries
    '<THIRD_PARTY_MODULES>',
    '',

    // 3. Environment & Configuration
    '^@/env(/.*)?$',
    '^@/config(/.*)?$',
    '',

    // 4. Core Utilities & Types
    '^@/lib(/.*)?$',
    '^@/utils(/.*)?$',
    '^@/types(/.*)?$',
    '^@/schemas(/.*)?$',
    '',

    // 5. Data Layer & Business Logic
    '^@/db(/.*)?$',
    '^@/actions(/.*)?$',
    '^@/data(/.*)?$',

    '',

    // 6. Hooks
    '^@/hooks(/.*)?$',

    '',

    // 7. UI & Presentation Layer
    '^@/styles(/.*)?$',
    '^@/components/ui(/.*)?$',
    '^@/components(/.*)?$',

    '',

    // 8. Feature-Specific & App Level
    '^@/features(/.*)?$',
    '^@/app(/.*)?$',

    '',
    // 9. Relative Imports
    '^[./]'
  ],
  plugins: ['@ianvs/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss']
}

export default config