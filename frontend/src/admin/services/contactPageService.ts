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

export const getContactPage = async () => {
  const response = await api.get("/admin/contact-page");
  return response.data.data;
};

export const updateContactPage = async (formData: FormData) => {
  const response = await api.post("/admin/contact-page", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    params: {
      _method: "PUT",
    },
  });

  return response.data;
};