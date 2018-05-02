export default async (req, res) => {
  await new Promise(resolve => { /* Will not be resolved */ })
  res.send('It will throw 408')
}
