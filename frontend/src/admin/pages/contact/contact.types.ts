export type ContactTabId =
  | "banner"
  | "connect"
  | "subtitle"
  | "message"
  | "video"
  | "details";

export type ContactImageField =
  | "banner_image"
  | "connect_with_us_image_one"
  | "connect_with_us_image_two";

export type ContactVideoField = "until_we_meet_video";

export interface ContactFormData {
  heading_one: string;
  heading_two: string;
  heading_highlight: string;
  connect_with_us: string;
  connect_with_us_supporting_text: string;
  subtitle_one: string;
  subtitle_two: string;
  send_us_message_text: string;
  until_we_meet_text: string;
}

export type ContactMediaUrls = Record<
  ContactImageField | ContactVideoField,
  string | null
>;

export type ContactImageFiles = Record<ContactImageField, File | null>;

