module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jest-environment-jsdom',
    transform: {
      '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest', // Use Babel to transform TS/JSX files
    },
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock CSS imports
      '^@/(.*)$': '<rootDir>/$1', // Resolve alias paths
    },
    setupFilesAfterEnv: ['./jest.setup.js'], // Include setup file
    coverageReporters: ['text-summary'],
    coveragePathIgnorePatterns: ['.*\\.test\\.js$','/node_modules/','/lib/s3.tsx', 'app/fonts/','/public/', 'app/instructor-application','app/manage-courses/module-view',  'app/manage-courses/upload-course','/coverage/','app/components/', 'app/admin/course-management/[id]/page.tsx',' app/admin/course-management/[id]']
  };