import axios from "axios";

const APIBaseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// ✅ Create Axios instance with better ngrok configuration
const axiosApi = axios.create({
  baseURL: `${APIBaseURL}/api`,
  timeout: 10000, // Reduced timeout for better debugging
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true", // Bypass ngrok warning
  },
});

// ✅ Request Interceptor: attach token
axiosApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request for debugging
    console.log(
      `🔄 API Call: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
    );
    return config;
  },
  (error) => {
    console.error("❌ Request Interceptor Error:", error);
    return Promise.reject(error);
  },
);

// ✅ Response Interceptor: handle and log errors cleanly
axiosApi.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url;
    const method = error?.config?.method;
    const msg =
      error?.response?.data?.errorMessage ||
      error?.response?.data?.message ||
      error.message;

    console.error(`🚨 API Error [${method?.toUpperCase()} ${url}]:`, {
      status: status || "No Status",
      message: msg,
      fullError: error,
    });

    // Handle specific ngrok/CORS issues
    if (error.code === "NETWORK_ERROR" || error.code === "ECONNREFUSED") {
      console.error(
        "🌐 Network Issue: Backend might not be accessible via ngrok",
      );
    }

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
        ...(config.headers || {}),
      },
      ...config,
    });

    return withHeaders ? response : response.data;
  } catch (error) {
    const errMsg =
      error?.data?.errorMessage ||
      error?.data?.message ||
      error.message ||
      "An unknown error occurred.";

    console.error("❌ makeAPICall failed:", {
      message: errMsg,
      url: option.url,
      method: option.method,
      error,
    });

    throw error;
  }
}

// ✅ Test connection function
export async function testBackendConnection() {
  try {
    const response = await axiosApi.get("/health"); // or whatever your health endpoint is
    console.log("✅ Backend connection successful:", response.data);
    return true;
  } catch (error) {
    console.error("❌ Backend connection failed:", error.message);
    return false;
  }
}

export default axiosApi;
