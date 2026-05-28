import fs from 'fs/promises';
import path from 'path';
import {
  Event,
  EventContentRecord,
  GalleryEvent,
  GalleryContentRecord,
  Leader,
  SiteEditableContent,
} from '@/lib/marketing-types';
import { createAdminClient } from '@/lib/supabase/admin';

const contentDirectory = path.join(process.cwd(), 'content');

// Try the CMS database first. Return null when the table is empty or when
// the env isn't configured (e.g. at build time on Vercel) so callers fall
// back to the bundled JSON files.
async function tryDbEvents(opts: { includeDrafts?: boolean } = {}): Promise<Event[] | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return null;
  }
  try {
    const admin = createAdminClient();
    const baseQuery = admin.from('events').select('*').order('starts_at', { ascending: true });
    const { data, error } = opts.includeDrafts
      ? await baseQuery
      : await baseQuery.eq('is_published', true);
    if (error) return null;
    if (!data) return [];
    return data.map((row) => ({
      id: row.slug,
      title: row.title,
      start: row.starts_at,
      end: row.ends_at ?? row.starts_at,
      date: row.starts_at,
      location: row.location ?? '',
      image: row.cover_image_url ?? '/images/events/event-placeholder.svg',
      imagePosition: row.cover_image_position ?? 'object-center',
      summary: row.description ?? '',
      description: row.description ?? '',
      status: 'published',
      category: row.status === 'past' ? 'past' : 'upcoming',
    } as unknown as Event));
  } catch {
    return null;
  }
}

async function tryDbLeaders(): Promise<Leader[] | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return null;
  }
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('board_members')
      .select('id, name, role, bio, photo_url, photo_position, linkedin_url, email, display_order, academic_year, is_active')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (error) return null;
    if (!data) return [];
    return data.map((row) => ({
      id: row.id,
      name: row.name,
      role: row.role,
      bio: row.bio ?? '',
      blurb: row.bio ?? '',
      image: row.photo_url ?? '',
      photo: row.photo_url ?? '',
      imagePosition: row.photo_position ?? 'object-center',
      email: row.email ?? undefined,
      linkedin: row.linkedin_url ?? undefined,
      academicYear: row.academic_year ?? undefined,
      social: row.linkedin_url ? { linkedin: row.linkedin_url } : undefined,
    } as unknown as Leader));
  } catch {
    return null;
  }
}

async function tryDbGallery(opts: { includeDrafts?: boolean } = {}): Promise<GalleryEvent[] | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return null;
  }
  try {
    const admin = createAdminClient();
    const baseQuery = admin
      .from('gallery_albums')
      .select('id, title, slug, created_at, is_published')
      .order('created_at', { ascending: false });
    const { data: albums, error } = opts.includeDrafts
      ? await baseQuery
      : await baseQuery.eq('is_published', true);
    if (error) return null;
    if (!albums || albums.length === 0) return [];

    const albumIds = albums.map((a) => a.id);
    const { data: imgs } = await admin
      .from('gallery_images')
      .select('id, album_id, image_url, caption, display_order')
      .in('album_id', albumIds)
      .order('display_order', { ascending: true });

    return albums.map((a) => ({
      id: a.slug,
      eventName: a.title,
      date: a.created_at,
      images: (imgs ?? [])
        .filter((i) => i.album_id === a.id)
        .map((i) => ({ id: i.id, src: i.image_url, caption: i.caption ?? undefined })),
    } as unknown as GalleryEvent));
  } catch {
    return null;
  }
}

async function tryDbSiteContent(): Promise<SiteEditableContent | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return null;
  }
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('site_content').select('id, body, metadata');
    if (error || !data || data.length === 0) return null;
    const result: Record<string, string | string[]> = {};
    for (const row of data) {
      const meta = row.metadata as { value?: string[] } | null;
      if (meta?.value && Array.isArray(meta.value)) {
        result[row.id] = meta.value;
      } else if (row.body != null) {
        result[row.id] = row.body;
      }
    }
    return { ...defaultSiteContent, ...(result as Partial<SiteEditableContent>) } as SiteEditableContent;
  } catch {
    return null;
  }
}

const defaultSiteContent: SiteEditableContent = {
  eventsIntro:
    'From cultural showcases to moments of service and community, our events bring the African diaspora together at Harvard throughout the year.',
  galleryIntro: 'Capturing moments from our community.',
  leadershipCurrentYear: 'AY 26-27',
  storyIntro:
    'The Harvard African Students Association (HASA) was founded with the mission of creating a supportive community for African students at Harvard University. Over the years, we have grown into a vibrant organization that celebrates the rich diversity of the African continent.',
  storyMissionTitle: 'Our Mission',
  storyMissionBody:
    'Our mission is to foster a sense of belonging for African students, to promote awareness of African issues and culture within the Harvard community, and to provide a platform for intellectual engagement with the continent.',
  storyActivitiesTitle: 'What We Do',
  storyActivitiesIntro:
    'We organize a wide range of events throughout the academic year, including:',
  storyActivities: [
    'Cultural showcases and performances',
    'Academic panels and discussions',
    'Social gatherings and networking events',
    'Community service initiatives',
  ],
};

type LeaderContentRecord = Leader & {
  [key: string]: unknown;
};

function asObject(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function readCollection<T>(parsed: unknown, key: string): T[] {
  if (Array.isArray(parsed)) {
    return parsed as T[];
  }

  const objectValue = asObject(parsed);
  const nested = objectValue[key];
  return Array.isArray(nested) ? (nested as T[]) : [];
}

function normalizeStoryActivities(value: unknown) {
  if (!Array.isArray(value)) {
    return defaultSiteContent.storyActivities;
  }

  const normalized = value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter(Boolean);

  return normalized.length > 0 ? normalized : defaultSiteContent.storyActivities;
}

function sortEventsByStart(records: EventContentRecord[]) {
  return [...records].sort(
    (a, b) =>
      new Date(a.start).getTime() - new Date(b.start).getTime() ||
      a.id.localeCompare(b.id)
  );
}

function sortGalleryByDate(records: GalleryContentRecord[]) {
  return [...records].sort(
    (a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id)
  );
}

export async function getLeaders(): Promise<Leader[]> {
  return (await tryDbLeaders()) ?? [];
}

export async function getEvents(opts: { includeDrafts?: boolean } = {}): Promise<Event[]> {
  return (await tryDbEvents(opts)) ?? [];
}

function normalizeGalleryRecord(record: GalleryContentRecord): GalleryEvent {
  if (Array.isArray(record.images)) {
    return {
      id: record.id,
      eventName: record.eventName,
      date: record.date,
      images: record.images,
    };
  }

  const fallbackImage = (record as unknown as { src?: string }).src;
  return {
    id: record.id,
    eventName: (record as unknown as { album?: string }).album || 'HASA Event',
    date: record.date,
    images: fallbackImage
      ? [{ id: `${record.id}-legacy`, src: fallbackImage }]
      : [],
  };
}

export async function getGallery(opts: { includeDrafts?: boolean } = {}): Promise<GalleryEvent[]> {
  return (await tryDbGallery(opts)) ?? [];
}

export async function getFeaturedEvents() {
  const events = await getEvents();
  // Most-recent 4, normalized into the FeaturedEvent shape the component
  // expects (required strings, not the wider Event union).
  return [...events]
    .reverse()
    .slice(0, 4)
    .map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      summary: e.summary ?? '',
      description: e.description ?? '',
      image: e.image ?? '',
    }));
}

export async function getSiteContent(): Promise<SiteEditableContent> {
  return (await tryDbSiteContent()) ?? defaultSiteContent;
}
