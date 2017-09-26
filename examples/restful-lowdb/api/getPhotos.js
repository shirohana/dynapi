import Photo from '~model/photo'

export default (req, res) => {
  const result = Photo.newest(5000)
  res.json(result)
}
