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


export const getAllRoles = async()=>{
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
}

export const addUser = async(payload : any) =>{
    try {
    const response = await axiosInstance.post("/user/add",payload);
     return { success: true, data: response.data };
  } catch (error: any) {
    console.error(
      "Add user  error:",
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
}

export const updateRoleUser = async(userId: number , payload:any)=>{
    try {
    const response = await axiosInstance.put(`/user/${userId}/update/role`,payload);
     return { success: true, data: response.data };
  } catch (error: any) {
    console.error(
      "Add user  error:",
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
}