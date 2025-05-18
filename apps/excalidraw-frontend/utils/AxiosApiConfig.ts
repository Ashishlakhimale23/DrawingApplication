import axios,{InternalAxiosRequestConfig,AxiosError} from 'axios'
const baseUrl = process.env.NEXT_PUBLIC_HTTP_SERVER
export const api = axios.create({
  baseURL: baseUrl,
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


