export type PublishStatus = 'draft' | 'published';

export interface LeaderSocialLinks {
  linkedin?: string;
  instagram?: string;
  github?: string;
}

export interface Leader {
  id: string;
  academicYear?: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  photo?: string;
  email?: string;
  linkedin?: string;
  social?: LeaderSocialLinks;
  imagePosition?: string;
  imageFit?: string;
  blurb?: string;
  majorYear?: string;
  responsibilities?: string[];
  funFact?: string;
  order?: number;
  status?: PublishStatus;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  start: string;
  end: string;
  location: string;
  description: string;
  category: 'upcoming' | 'past';
  image?: string;
  summary?: string;
}

export interface GalleryImage {
  id: string;
  src: string;
}

export interface GalleryEvent {
  id: string;
  eventName: string;
  date: string;
  images: GalleryImage[];
}

export interface UploadMetadata {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface EventContentRecord {
  id: string;
  title: string;
  start: string;
  end: string;
  location: string;
  image: string;
  summary: string;
  description: string;
  status: PublishStatus;
}

export interface GalleryImageRecord extends GalleryImage {
  metadata?: UploadMetadata;
}

export interface GalleryContentRecord {
  id: string;
  eventName: string;
  date: string;
  status: PublishStatus;
  images: GalleryImageRecord[];
}

export interface SiteEditableContent {
  eventsIntro: string;
  galleryIntro: string;
  leadershipCurrentYear: string;
  storyIntro: string;
  storyMissionTitle: string;
  storyMissionBody: string;
  storyActivitiesTitle: string;
  storyActivitiesIntro: string;
  storyActivities: string[];
}
