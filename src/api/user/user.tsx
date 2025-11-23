import { axiosInstance } from "../axiosConfig";

export const getAllUser = async (params: any) => {
  try {
    const response = await axiosInstance.get("/user/list", {
      params,
    });

    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Get all user error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

export const updateUserStatus = async (
  userId: number,
  status: "ACTIVE" | "INACTIVE"
) => {
  try {
    // PUT với query param ?status=...
    const response = await axiosInstance.put(
      `/user/${userId}/updateStatus`,
      null,
      {
        params: { status }, // gửi query param
      }
    );

    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(
      "Update user status error:",
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};

export const getAllRoles = async () => {
  try {
    const response = await axiosInstance.get("/role/list");
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(
      "Get all roles  error:",
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};

export const addUser = async (payload: any) => {
  try {
    const response = await axiosInstance.post("/user/add", payload);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(
      "Add user  error:",
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};

export const updateRoleUser = async (userId: number, payload: any) => {
  try {
    const response = await axiosInstance.put(
      `/user/${userId}/update/role`,
      payload
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(
      "Add user  error:",
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};

// Address Management APIs
export const addAddress = async (payload: any) => {
  try {
    const response = await axiosInstance.post("/user/add/address", payload);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Add address error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

export const updateAddress = async (userHasAddressId: number, payload: any) => {
  try {
    const response = await axiosInstance.put(
      `/user/address/update/${userHasAddressId}`,
      payload
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Update address error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

export const deleteAddress = async (userHasAddressId: number) => {
  try {
    const response = await axiosInstance.delete(
      `/user/address/delete/${userHasAddressId}`
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Delete address error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

export const setDefaultAddress = async (userHasAddressId: number) => {
  try {
    const response = await axiosInstance.put(
      `/user/address/default/${userHasAddressId}`
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Set default address error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

// User Profile Update APIs
export const updateUser = async (payload: any) => {
  try {
    const response = await axiosInstance.put("/user/update", payload);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Update user error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

export const changePassword = async (payload: any) => {
  try {
    const response = await axiosInstance.post("/user/change-password", payload);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Change password error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

// OTP APIs
export const sendOTP = async (
  userId: number,
  otpType: "PASSWORD_RESET" | "VERIFICATION" | "EMAIL_RESET" | "TWO_FACTOR_AUTH"
) => {
  try {
    const response = await axiosInstance.post("/otp/send", null, {
      params: { userId, otpType },
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Send OTP error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

export const verifyOTP = async (
  userId: number,
  inputOtp: string,
  otpType: "PASSWORD_RESET" | "VERIFICATION" | "EMAIL_RESET" | "TWO_FACTOR_AUTH"
) => {
  try {
    const response = await axiosInstance.post("/otp/verify-otp", null, {
      params: { userId, inputOtp, otpType },
    });
    // Returns { data: "resetToken" }
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Verify OTP error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get("/user/me");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Get current user error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

export const verifyAccount = async (userId: number, resetToken: string) => {
  try {
    const response = await axiosInstance.post("/user/verify-account", null, {
      params: { userId, resetToken },
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Verify account error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

export const changeEmail = async (newEmail: string, resetToken: string) => {
  try {
    const response = await axiosInstance.post("/user/change-email", null, {
      params: { newEmail, resetToken },
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Change email error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

export const findByUserName = async (userName: string) => {
  try {
    const response = await axiosInstance.get("/user/findByUserName", {
      params: { userName },
    });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Find user by username error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

export const forgotPassword = async (
  payload: { userId: number; password: string; confirmPassword: string },
  resetToken: string
) => {
  try {
    const response = await axiosInstance.post("/user/forgot-password", payload, {
      params: { resetToken },
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Forgot password error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

