export type EventType = 'wedding' | 'birthday' | 'graduation' | 'engagement' | 'other';
export type PackageType = 'eco' | 'standard' | 'premium';
export type FileType = 'photo' | 'video';
export type Locale = 'tr' | 'en' | 'de';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Event {
  id: string;
  host_id: string;
  title: string;
  event_type: EventType;
  slug: string;
  event_date: string | null;
  cover_image_key: string | null;
  cover_image_url: string | null;
  thank_you_message: string | null;
  thank_you_video_url: string | null;
  pin_enabled: boolean;
  package_type: PackageType;
  template_id: string;
  guest_count_estimate: number | null;
  is_upload_active: boolean;
  upload_expires_at: string | null;
  media_retention_until: string | null;
  photo_count: number;
  video_count: number;
  created_at: string;
  updated_at: string;
}

// pin_code_hash asla client'a gönderilmez — ayrı tip
export type PublicEvent = Omit<Event, 'pin_code_hash'>;

export interface MediaItem {
  id: string;
  event_id: string;
  guest_name: string;
  guest_note: string | null;
  file_key: string;
  file_url: string;
  file_type: FileType;
  file_size: number | null;
  original_filename: string | null;
  is_visible: boolean;
  uploaded_at: string;
}

export interface PresignResponse {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
}

export interface UploadPayload {
  eventId: string;
  guestName: string;
  guestNote?: string;
  fileType: FileType;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface Dictionary {
  guest: {
    welcome: string;
    enterName: string;
    namePlaceholder: string;
    noteOptional: string;
    openCamera: string;
    selectFromGallery: string;
    uploading: string;
    uploadMore: string;
    pinTitle: string;
    pinDescription: string;
    pinError: string;
    confirm: string;
    thankYouDefault: string;
  };
  errors: {
    uploadFailed: string;
    eventClosed: string;
    limitReached: string;
  };
}
