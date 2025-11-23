import { axiosInstance } from "../axiosConfig";


interface LoginPayload {
  username: string;
  password: string;
}

export const login = async (payload: LoginPayload) => {
  try {
    const response = await axiosInstance.post("/auth/login", payload);
    console.log("Login response:", response);
    const { token } = response.data;

    if (token) {
      localStorage.setItem("token", token);
    }

    return { success: true, token };
  } catch (error: any) {
    // Prevent redirect on 401 for login
    if (error.response?.status === 401) {
      // Do not trigger window.location.href here
      return { success: false, error: error.response?.data || error.message };
    }
    console.error("Login error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

export const logout = () => {
  localStorage.removeItem("token");
};

export const logoutApi = async () => {
  const token = localStorage.getItem("token");
  try {
    await axiosInstance.post("/logout", { token });
  } catch (error: any) {
    console.error("Logout error:", error.response?.data || error.message);
  } finally {
    localStorage.removeItem("token");
  }
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token");
  return !!token;
};

export const getCurrentUser = async () => {
  try {
    const res = await axiosInstance.get("/user/me");

    // Trả thẳng dữ liệu user
    return { success: true, data: res.data.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};