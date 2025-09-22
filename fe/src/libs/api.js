

import axios from 'axios';


const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  timeout: 1000,
  headers: { 'X-Custom-Header': 'foobar' }
});


const Axios = async (data) => {
  if (data.token) api.defaults.headers.common['Authorization'] = data.token;
  return await api({
    method:data.method,
    url:data.url,
    data:data.data
  })
}

export default Axios