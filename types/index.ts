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
  invitation_enabled: boolean;
  programs: ProgramItem[];
  upload_expires_at: string | null;
  media_retention_until: string | null;
  photo_count: number;
  video_count: number;
  created_at: string;
  updated_at: string;
}

// Davetiye sayfası programları — events.programs JSONB kolonunda saklanır.
// Her zaman parent event ile birlikte tek parça okunup yazılır (child tablo değil).
export interface ProgramItem {
  id: string;          // nanoid(8) — liste düzenleme/sıralama için client tarafında üretilir
  name: string;        // "Kına Gecesi", "Nikah Töreni", "Düğün"...
  venueName: string;
  address: string;
  mapsUrl?: string;    // hostun yapıştırdığı Google Maps paylaşım linki
  date: string;        // YYYY-MM-DD
  time?: string;       // HH:mm
}

// pin_code_hash asla client'a gönderilmez — davetiye alanları da guest
// upload akışında hiç okunmadığı için burada tutulmuyor
export type PublicEvent = Omit<Event, 'pin_code_hash' | 'invitation_enabled' | 'programs'>;

export interface MediaItem {
  id: string;
  event_id: string;
  guest_name: string;
  guest_note: string | null;
  file_key: string;
  file_url: string;
  viewUrl?: string; // presigned GET URL, added by /api/media
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
  contentType: string;
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
    upload?: string;
    uploadMore: string;
    addMore?: string;
    back?: string;
    pinTitle: string;
    pinDescription: string;
    pinError: string;
    confirm: string;
    thankYouTitle?: string;
    thankYouDefault: string;
    shareMemories: string;
    shareMemoriesDesc: string;
    uploadClosedTitle: string;
    uploadClosedDesc: string;
    uploadingCount: string;
    uploadError: string;
    retryUpload?: string;
    backToList?: string;
    filesSelected: string;
    photoCount?: string;
    videoCount?: string;
    packageLabel?: string;
    photoLimitExceeded?: string;
    videoLimitExceeded?: string;
  };
  errors: {
    uploadFailed: string;
    eventClosed: string;
    limitReached: string;
  };
  invitation: {
    eyebrow: string;
    programTitle: string;
    getDirections: string;
    mapUnavailable: string;
    seeYouThere: string;
    cancel: string;
  };
}
