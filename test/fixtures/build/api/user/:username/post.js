export default (req, res) => {
  res.json(req.user)
}

// Timeout === 0 will reject all the request
export const timeout = 0
