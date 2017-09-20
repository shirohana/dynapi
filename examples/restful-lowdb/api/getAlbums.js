import Album from '~model/album'

export default (req, res) => {
  const result = Album.newest(100)
  res.json(result)
}
