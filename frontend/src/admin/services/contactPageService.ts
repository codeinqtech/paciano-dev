import api from "@/services/api";

export interface ContactPageData {
  id?: number;

  banner_image: string | null;
  heading_one: string;
  heading_two: string;
  heading_highlight: string;

  connect_with_us: string;
  connect_with_us_supporting_text: string;
  connect_with_us_image_one: string | null;
  connect_with_us_image_two: string | null;

  subtitle_one: string;
  subtitle_two: string;

  send_us_message_text: string;
  until_we_meet_text: string;
  until_we_meet_video: string | null;
}

interface ContactPageApiResponse {
  success?: boolean;
  message?: string;
  data: ContactPageData;
}

export const getContactPage = async (): Promise<ContactPageData> => {
  const response = await api.get<ContactPageApiResponse>(
    "/admin/contact-page"
  );

  return response.data.data;
};

export const updateContactPage = async (
  formData: FormData
): Promise<ContactPageData> => {

  formData.append("_method", "PUT");

  console.log("Updating contact page with formData:", formData);
  const response = await api.post<ContactPageApiResponse>(
    "/admin/contact-page",
    formData
  );

  return response.data.data;
};


export interface ContactDetail {
  id: number;
  type: string;
  label: string;
  value: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean | number;
}

export interface ContactDetailPayload {
  type: string;
  label: string;
  value: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

export const getContactDetails = async (): Promise<ContactDetail[]> => {
  const response = await api.get("/admin/contact-details");

  return response.data.data ?? response.data;
};

export const createContactDetail = async (
  payload: ContactDetailPayload
): Promise<ContactDetail> => {
  const response = await api.post(
    "/admin/contact-details",
    payload
  );

  return response.data.data ?? response.data;
};

export const updateContactDetail = async (
  id: number,
  payload: ContactDetailPayload
): Promise<ContactDetail> => {
  const response = await api.put(
    `/admin/contact-details/${id}`,
    payload
  );

  return response.data.data ?? response.data;
};

export const deleteContactDetail = async (
  id: number
): Promise<void> => {
  await api.delete(`/admin/contact-details/${id}`);
};

