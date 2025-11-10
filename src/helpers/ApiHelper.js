import axios from "axios";

const APIBaseURL = import.meta.env.API_BASE_URL;

// ✅ Create Axios instance
const axiosApi = axios.create({
  baseURL: `${APIBaseURL}/api`,
  timeout: 20000,
});

// ✅ Request Interceptor: attach token
axiosApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ✅ Response Interceptor: handle and log errors cleanly
axiosApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const msg =
      error?.response?.data?.errorMessage ||
      error?.response?.data?.message ||
      error.message;

    console.error(`🚨 API Error [${status || "No Status"}]:`, msg);
    return Promise.reject(error.response || error);
  },
);

// ✅ Generic API call function
export async function makeAPICall(
  { option, data = {}, params = {}, config = {} },
  withHeaders = false,
  contentType = "application/json",
) {
  try {
    const response = await axiosApi.request({
      method: option.method,
      url: option.url,
      data,
      params,
      headers: {
        "Content-Type": contentType,
        "ngrok-skip-browser-warning": "true",
        ...(config.headers || {}),
      },
      ...config,
    });

    // Return data or full response with headers if needed
    return withHeaders ? response : response.data;
  } catch (error) {
    // Provide a clean error message
    const errMsg =
      error?.data?.errorMessage ||
      error?.data?.message ||
      error.message ||
      "An unknown error occurred.";
    console.error("❌ makeAPICall failed:", errMsg);
    throw error;
  }
}

export default axiosApi;
