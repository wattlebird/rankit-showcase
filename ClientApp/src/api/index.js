import axios from 'axios';

const baseUrl = '/api/anime';

function ReadAll(start = 0, len = 50000) {
  return axios
    .get(`${baseUrl}/list`, {
      params: {
        start,
        length: len,
      },
    })
    .then(data => data.data);
}

function Search(q) {
  return axios.get(`${baseUrl}/search`, {
    params: {
      q,
    },
  });
}

function Date() {
  return axios.get(`${baseUrl}/date`).then(data => data.data);
}

export default {
  ReadAll,
  Search,
  Date,
};
