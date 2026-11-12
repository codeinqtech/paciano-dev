import {
  Image,
  MessageSquare,
  FileText,
  Mail,
  Video,
  Phone,
} from "@/components/common/icons";

import type {
  ContactFormData,
  ContactImageFiles,
  ContactMediaUrls,
  ContactTabId,
} from "./contact.types";

export const initialContactFormData: ContactFormData = {
  heading_one: "",
  heading_two: "",
  heading_highlight: "",
  connect_with_us: "",
  connect_with_us_supporting_text: "",
  subtitle_one: "",
  subtitle_two: "",
  send_us_message_text: "",
  until_we_meet_text: "",
};

export const initialContactMediaUrls: ContactMediaUrls = {
  banner_image: null,
  connect_with_us_image_one: null,
  connect_with_us_image_two: null,
  until_we_meet_video: null,
};

export const initialContactImageFiles: ContactImageFiles = {
  banner_image: null,
  connect_with_us_image_one: null,
  connect_with_us_image_two: null,
};

export const contactTextFields: (keyof ContactFormData)[] = [
  "heading_one",
  "heading_two",
  "heading_highlight",
  "connect_with_us",
  "connect_with_us_supporting_text",
  "subtitle_one",
  "subtitle_two",
  "send_us_message_text",
  "until_we_meet_text",
];

export const contactTabs: {
  id: ContactTabId;
  label: string;
  icon: typeof Image;
}[] = [
  { id: "banner", label: "Banner", icon: Image },
  { id: "connect", label: "Connect With Us", icon: MessageSquare },
  { id: "subtitle", label: "Subtitles", icon: FileText },
  { id: "message", label: "Message", icon: Mail },
  { id: "video", label: "Until We Meet", icon: Video },
  { id: "details", label: "Contact Details", icon: Phone },
];
