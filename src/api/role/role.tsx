import { axiosInstance } from "../axiosConfig";

export const getRoleDetail = async (roleId: number) => {
  try {
    const response = await axiosInstance.get(`/role/${roleId}`);
    return { success: true, data: response.data.data };
  } catch (error : any) {
    console.error("Get  role error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

export const getAllPermission = async () => {
  try {
    const response = await axiosInstance.get("/permission/list");
     return { success: true, data: response.data };
  } catch (error: any) {
    console.error(
      "Get all permission  error:",
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
};

export const createRole = async(payload : any)=>{
try {
    const response = await axiosInstance.post("/role/add" , payload);
     return { success: true, data: response.data };
  } catch (error: any) {
    console.error(
      "Get add role error:",
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
}

export const updateRole = async(roleId:number , payload : any)=>{
try {
    const response = await axiosInstance.put(`/role/update/${roleId}` , payload);
     return { success: true, data: response.data };
  } catch (error: any) {
    console.error(
      "Get add role error:",
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
}

export const updateRoleStatus = async(roleId:number , status :string)=>{
    try {
    const response = await axiosInstance.put(`/role/updateStatus/${roleId}` , status);
     return { success: true, data: response.data };
  } catch (error: any) {
    console.error(
      "Update status role error:",
      error.response?.data || error.message
    );
    return { success: false, error: error.response?.data || error.message };
  }
}