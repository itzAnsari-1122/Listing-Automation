import axios from "axios";

// const APIBaseURL = "http://localhost:8080/api";
const APIBaseURL = "https://druffen-mickie-acapella.ngrok-free.dev/api";

const axiosApi = axios.create({
  baseURL: APIBaseURL,
  timeout: 20000,
});

axiosApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

axiosApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const msg = error?.response?.data?.errorMessage;

    console.error("API error:", msg || error.message);

    return Promise.reject(error?.response || error);
  }
);
export async function makeAPICall(
  { option, data, params, config = {} },
  withHeaders = false,
  contentType = "application/json"
) {
  try {
    const response = await axiosApi.request({
      method: option.method,
      url: option.url,
      data,
      params,
      headers: {
        "Content-Type": contentType,
        ...(config.headers || {}),
      },
      ...config,
    });

    return withHeaders ? response : response.data;
  } catch (error) {
    throw error;
  }
}
