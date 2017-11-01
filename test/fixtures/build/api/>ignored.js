export const ignore = true // Ignored middlewares would do nothing

export default (req, res, next) => {
  // Do nothing but increase coverage
  next(new Error('Ignored middleware would not been executed'))
}
