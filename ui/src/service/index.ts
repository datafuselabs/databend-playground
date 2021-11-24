import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';

let axiosInstance: AxiosInstance = axios.create({
  baseURL: '/',
  headers: {
    "Content-Type": "application/json;charset=UTF-8"
  }
});

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.status && response.status === 200) {
      return response.data;
    } else {
      // show some tips
      return response.data;
    }
  },
  // error
  (error: any) => {
    const { response } = error;
    if (response) {
      return Promise.reject(response.data);
    } else {
      message.error('network error, try again later.');
    }
  }
);

// axios instance
axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Request to intercept
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
)

export default axiosInstance;