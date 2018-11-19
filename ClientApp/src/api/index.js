import axios from 'axios'

const baseUrl = 'https://localhost:5001/api/anime'

function ReadAll(start=0, len=50000){
  return axios.get(`${baseUrl}/list`, {
    params: {
      start,
      length: len
    }
  }).then(data => {
    return data.data
  })
}

function Search(q) {
  return axios.get(`${baseUrl}/search`, {
    params: {
      q
    }
  })
}

export default {
  ReadAll,
  Search
}