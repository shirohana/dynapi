// https://github.com/tc39/proposal-pipeline-operator#introduction

export default (req, res) => {
  const result = "hello"
    |> doubleSay
    |> capitalize
    |> exclaim

  res.send(result) // => 'Hello, hello!'
}

function doubleSay (str) {
  return str + ", " + str
}

function capitalize (str) {
  return str[0].toUpperCase() + str.substring(1)
}

function exclaim (str) {
  return str + '!'
}
