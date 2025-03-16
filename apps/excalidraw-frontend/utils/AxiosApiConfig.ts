import axios,{InternalAxiosRequestConfig,AxiosError} from 'axios'
export const api = axios.create({
  baseURL: "http://localhost:8000",
});

api.interceptors.request.use(function(config:InternalAxiosRequestConfig){
  const authtoken = localStorage.getItem("authtoken")
  console.log(authtoken)
  if(!authtoken){
    window.location.href = "/signin"
    return Promise.reject('No token found')
  }

  config.headers = config.headers || {};
  config.headers.Authorization = `Bearer ${authtoken}`;

  return config

},function (error: AxiosError) {
    return Promise.reject(error);
  })


