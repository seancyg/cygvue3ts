import axios from "axios";
import type { AxiosInstance } from "axios";
import type { MyInterceptors, MyRequestConfig } from "./type";

export class MyRequest {
  instance: AxiosInstance;
  interceptors?: MyInterceptors;
  constructor(config: MyRequestConfig) {
    //创建axios实例
    this.instance = axios.create(config);

    //保存配置信息
    this.interceptors = config.interceptors;

    //使用拦截器
    //1.对应实例拦截器
    this.instance.interceptors.request.use(
      this.interceptors?.requestInterceptor,
      this.interceptors?.requestInterceptorCatch
    );
    this.instance.interceptors.response.use(
      this.interceptors?.responseInterceptor,
      this.interceptors?.responseInterceptorCatch
    );

    //2.所有实例拦截器
    this.instance.interceptors.request.use(
      (config: any) => {
        return config;
      },
      (err: any) => {
        return err;
      }
    );
    this.instance.interceptors.response.use(
      (res: any) => {
        return res;
      },
      (err: any) => {
        return err;
      }
    );
  }

  request<T>(config: MyRequestConfig<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      // 3.单个请求拦截器
      if (config.interceptors?.requestInterceptor) {
        config = config.interceptors.requestInterceptor(config);
      }
      this.instance
        .request<any, T>(config)
        .then((res) => {
          if (config.interceptors?.responseInterceptor) {
            res = config.interceptors.responseInterceptor(res);
          }
          resolve(res);
        })
        .catch((err) => {
          if (config.interceptors?.responseInterceptorCatch) {
            err = config.interceptors.responseInterceptorCatch(err);
          }
          reject(err);
        });
    });
  }
  get<T>(config: MyRequestConfig<T>): Promise<T> {
    return this.request<T>({ ...config, method: "GET" });
  }

  post<T>(config: MyRequestConfig<T>): Promise<T> {
    return this.request<T>({ ...config, method: "POST" });
  }

  delete<T>(config: MyRequestConfig<T>): Promise<T> {
    return this.request<T>({ ...config, method: "DELETE" });
  }

  patch<T>(config: MyRequestConfig<T>): Promise<T> {
    return this.request<T>({ ...config, method: "PATCH" });
  }
}
