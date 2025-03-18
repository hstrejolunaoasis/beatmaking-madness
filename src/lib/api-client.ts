import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export type License = {
  id: string;
  name: string;
  type: "basic" | "premium" | "exclusive";
  description: string;
  price: number;
  features: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateLicenseDTO = Omit<License, "id" | "createdAt" | "updatedAt">;
export type UpdateLicenseDTO = Partial<CreateLicenseDTO>;

// License API
export const getLicenses = async (): Promise<License[]> => {
  const response = await axios.get(`${API_URL}/api/licenses`);
  return response.data;
};

export const getLicense = async (id: string): Promise<License> => {
  const response = await axios.get(`${API_URL}/api/licenses/${id}`);
  return response.data;
};

export const createLicense = async (data: CreateLicenseDTO): Promise<License> => {
  const response = await axios.post(`${API_URL}/api/licenses`, data);
  return response.data;
};

export const updateLicense = async (id: string, data: UpdateLicenseDTO): Promise<License> => {
  const response = await axios.patch(`${API_URL}/api/licenses/${id}`, data);
  return response.data;
};

export const deleteLicense = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/api/licenses/${id}`);
}; 