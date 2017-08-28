// Root middleware
export default (req, res, next) => {
  // Do nothing but increase coverage
  next(new Error('Ignored middleware should not do anything'))
}

// Ignored middleware
export const ignore = true
