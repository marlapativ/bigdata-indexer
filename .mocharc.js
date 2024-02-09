module.exports = {
  require: 'ts-node/register',
  watchExtensions: ['js', 'ts'],
  extension: ['js', 'ts'],
  spec: ['./tests/**/*.spec.*'],
  recursive: true
}
