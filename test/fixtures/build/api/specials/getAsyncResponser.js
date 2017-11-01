export default async (req, res) => {
  await new Promise(resolve => setTimeout(resolve, 200))
  res.json({ message: 'Resolved!' })
}
