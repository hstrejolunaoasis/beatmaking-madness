import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export type LicenseType = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateLicenseTypeDTO = Omit<LicenseType, "id" | "createdAt" | "updatedAt">;
export type UpdateLicenseTypeDTO = Partial<CreateLicenseTypeDTO>;

export type License = {
  id: string;
  name: string;
  licenseTypeId: string;
  licenseType?: LicenseType;
  description: string;
  price: number;
  features: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateLicenseDTO = Omit<License, "id" | "createdAt" | "updatedAt" | "licenseType">;
export type UpdateLicenseDTO = Partial<CreateLicenseDTO>;

export interface Beat {
  id: string;
  title: string;
  producer: string;
  price: number;
  bpm: number;
  key: string;
  tags: string[];
  genreId: string;
  genre?: {
    id: string;
    name: string;
    slug: string;
  };
  mood: string;
  imageUrl: string;
  audioUrl: string;
  waveformUrl: string;
  createdAt: string;
  updatedAt: string;
}

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

export const duplicateLicense = async (id: string): Promise<License> => {
  const response = await axios.post(`${API_URL}/api/licenses/${id}/duplicate`);
  return response.data;
};

// License Type API
export const getLicenseTypes = async (): Promise<LicenseType[]> => {
  const response = await axios.get(`${API_URL}/api/license-types`);
  return response.data;
};

export const getLicenseType = async (id: string): Promise<LicenseType> => {
  const response = await axios.get(`${API_URL}/api/license-types/${id}`);
  return response.data;
};

export const createLicenseType = async (data: CreateLicenseTypeDTO): Promise<LicenseType> => {
  const response = await axios.post(`${API_URL}/api/license-types`, data);
  return response.data;
};

export const updateLicenseType = async (id: string, data: UpdateLicenseTypeDTO): Promise<LicenseType> => {
  const response = await axios.patch(`${API_URL}/api/license-types/${id}`, data);
  return response.data;
};

export const deleteLicenseType = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/api/license-types/${id}`);
};

// Beat API functions
export const getBeats = async (): Promise<Beat[]> => {
  const response = await fetch("/api/beats");
  
  if (!response.ok) {
    throw new Error("Failed to fetch beats");
  }
  
  const data = await response.json();
  return data.data;
};

export const getBeat = async (id: string): Promise<Beat> => {
  const response = await fetch(`/api/beats/${id}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch beat");
  }
  
  const data = await response.json();
  return data.data;
};

export const createBeat = async (beat: Partial<Beat>): Promise<Beat> => {
  const response = await fetch("/api/beats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(beat),
  });
  
  if (!response.ok) {
    throw new Error("Failed to create beat");
  }
  
  const data = await response.json();
  return data.data;
};

export const updateBeat = async (id: string, beat: Partial<Beat>): Promise<Beat> => {
  const response = await fetch(`/api/beats/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(beat),
  });
  
  if (!response.ok) {
    throw new Error("Failed to update beat");
  }
  
  const data = await response.json();
  return data.data;
};

export const deleteBeat = async (id: string): Promise<void> => {
  const response = await fetch(`/api/beats/${id}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    throw new Error("Failed to delete beat");
  }
};

// Beat-License association functions
export const getBeatLicenses = async (beatId: string): Promise<any[]> => {
  const response = await fetch(`/api/beats/${beatId}/licenses`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch beat licenses");
  }
  
  const data = await response.json();
  return data.data;
};

export const updateBeatLicenses = async (beatId: string, licenseIds: string[]): Promise<void> => {
  const response = await fetch(`/api/beats/${beatId}/licenses`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ licenseIds }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to update beat licenses");
  }
}; 