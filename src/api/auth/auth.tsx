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
    console.error("Login error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

export const logout = () => {
  localStorage.removeItem("token");
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token");
  return !!token;
};

export const getCurrentUser =()=>{
  try {
    const res = axiosInstance.get("/user/me");
     return { success: true , res};
  } catch (error : any) {
    return { success: false, error: error.response?.data || error.message };
  }
}