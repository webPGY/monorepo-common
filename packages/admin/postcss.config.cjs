module.exports = {
  plugins: {
    autoprefixer: {
      grid: 'autoplace'
    },
    'postcss-preset-env': {
      stage: 0,
      autoprefixer: { grid: 'autoplace' },
      features: {
        'nesting-rules': true
      }
    }
  }
}
