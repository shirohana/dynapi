export const timeout = 200

export default async (req, res) => {
  await new Promise(resolve => setTimeout(resolve, 600))
  res.send('It will throw 408')
}
