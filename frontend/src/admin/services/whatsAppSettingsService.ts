import api from "@/services/api";

export interface WhatsAppSetting {
  id: number;
  api_version: string;
  phone_number_id: string;
  business_account_id: string | null;
  access_token_configured: boolean;
  recipient: string;
  template_name: string;
  template_language: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppSettingPayload {
  api_version: string;
  phone_number_id: string;
  business_account_id: string;
  access_token: string;
  recipient: string;
  template_name: string;
  template_language: string;
  is_active?: boolean;
}

interface WhatsAppSettingsApiResponse {
  success: boolean;
  message?: string;
  data: WhatsAppSetting | WhatsAppSetting[];
}

// Get all saved configurations
export const getWhatsAppSettings = async (): Promise<WhatsAppSetting[]> => {
  const response = await api.get<WhatsAppSettingsApiResponse>(
    "/admin/whatsapp-settings"
  );

  return Array.isArray(response.data.data)
    ? response.data.data
    : [];
};

// Create a new configuration
export const createWhatsAppSetting = async (
  payload: WhatsAppSettingPayload
): Promise<WhatsAppSetting> => {
  const response = await api.post<WhatsAppSettingsApiResponse>(
    "/admin/whatsapp-settings",
    payload
  );

  return response.data.data as WhatsAppSetting;
};

// Update an existing configuration
export const updateWhatsAppSetting = async (
  id: number,
  payload: WhatsAppSettingPayload
): Promise<WhatsAppSetting> => {
  const response = await api.put<WhatsAppSettingsApiResponse>(
    `/admin/whatsapp-settings/${id}`,
    payload
  );

  return response.data.data as WhatsAppSetting;
};

// Activate a saved configuration
export const activateWhatsAppSetting = async (
  id: number
): Promise<WhatsAppSetting> => {
  const response = await api.post<WhatsAppSettingsApiResponse>(
    `/admin/whatsapp-settings/${id}/activate`
  );

  return response.data.data as WhatsAppSetting;
};

export interface WhatsAppEnquiry {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  preferred_dates: string | null;
  message: string;
  status: string | null;
  whatsapp_status: string | null;
  whatsapp_message_sid: string | null;
  whatsapp_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppEnquiryResponse {
  current_page: number;
  data: WhatsAppEnquiry[];
  last_page: number;
  per_page: number;
  total: number;
}

export interface WhatsAppEnquiryFilters {
  page?: number;
  search?: string;
  whatsapp_status?: string;
}

export const getWhatsAppEnquiries = async (
  filters: WhatsAppEnquiryFilters = {}
): Promise<WhatsAppEnquiryResponse> => {
  const response = await api.get("/admin/whatsapp-settings/enquiries", {
    params: filters,
  });

  return response.data.data;
};

