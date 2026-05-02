module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'refactor', 'perf', 'docs', 'chore', 'security', 'test', 'ci',
    ]],
    'subject-case': [0],
    'header-max-length': [2, 'always', 100],
  },
};
