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
async function tryDbEvents(): Promise<Event[] | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return null;
  }
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('events')
      .select('*')
      .eq('is_published', true)
      .order('starts_at', { ascending: true });
    if (error || !data || data.length === 0) return null;
    return data.map((row) => ({
      id: row.slug,
      title: row.title,
      start: row.starts_at,
      end: row.ends_at ?? row.starts_at,
      date: row.starts_at,
      location: row.location ?? '',
      image: row.cover_image_url ?? '/images/events/event-placeholder.svg',
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
      .select('id, name, role, bio, photo_url, linkedin_url, email, display_order, academic_year, is_active')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (error || !data || data.length === 0) return null;
    return data.map((row) => ({
      id: row.id,
      name: row.name,
      role: row.role,
      bio: row.bio ?? '',
      blurb: row.bio ?? '',
      image: row.photo_url ?? '',
      photo: row.photo_url ?? '',
      email: row.email ?? undefined,
      linkedin: row.linkedin_url ?? undefined,
      academicYear: row.academic_year ?? undefined,
      social: row.linkedin_url ? { linkedin: row.linkedin_url } : undefined,
    } as unknown as Leader));
  } catch {
    return null;
  }
}

async function tryDbGallery(): Promise<GalleryEvent[] | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return null;
  }
  try {
    const admin = createAdminClient();
    const { data: albums, error } = await admin
      .from('gallery_albums')
      .select('id, title, slug, created_at, is_published')
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    if (error || !albums || albums.length === 0) return null;

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
  const fromDb = await tryDbLeaders();
  if (fromDb) return fromDb;

  const filePath = path.join(contentDirectory, 'leaders.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  const data = JSON.parse(fileContents) as unknown;
  const leaders = readCollection<LeaderContentRecord>(data, 'leaders');
  
  return leaders
    .filter((leader) => leader.status !== 'draft')
    .sort(
      (a, b) =>
        (a.order ?? Number.MAX_SAFE_INTEGER) -
          (b.order ?? Number.MAX_SAFE_INTEGER) ||
        a.name.localeCompare(b.name)
    )
    .map((leader) => ({
      ...leader,
      academicYear:
        typeof leader.academicYear === 'string' ? leader.academicYear : 'AY 25-26',
      image: leader.image || leader.photo || '/images/placeholder.jpg',
      photo: leader.photo || leader.image,
      linkedin: leader.linkedin || leader.social?.linkedin,
      email: leader.email,
    }));
}

export async function getEvents(): Promise<Event[]> {
  // CMS database is source of truth once populated; otherwise fall back to
  // the bundled events.json so the public site never goes blank.
  const fromDb = await tryDbEvents();
  if (fromDb) return fromDb;

  const filePath = path.join(contentDirectory, 'events.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  const data = JSON.parse(fileContents) as unknown;
  const events = sortEventsByStart(
    readCollection<EventContentRecord>(data, 'events').filter(
      (event) => event.status !== 'draft'
    )
  );

  return events.map((event) => {
    const startDate = new Date(event.start);
    const isUpcoming = startDate > new Date();

    return {
      ...event,
      date: event.start,
      start: event.start,
      end: event.end,
      category: isUpcoming ? 'upcoming' : 'past',
    };
  });
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

export async function getGallery(): Promise<GalleryEvent[]> {
  const fromDb = await tryDbGallery();
  if (fromDb) return fromDb;

  const filePath = path.join(contentDirectory, 'gallery.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  const data = JSON.parse(fileContents) as unknown;
  const gallery = sortGalleryByDate(
    readCollection<GalleryContentRecord>(data, 'gallery').filter(
      (item) => item.status !== 'draft'
    )
  );

  return gallery.map((item) => ({
    ...normalizeGalleryRecord(item),
  }));
}

export async function getFeaturedEvents() {
  const filePath = path.join(contentDirectory, 'events.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  const data = JSON.parse(fileContents) as unknown;
  const events = readCollection<EventContentRecord>(data, 'events');
  return sortEventsByStart(
    events.filter((event) => event.status !== 'draft')
  )
    .reverse()
    .slice(0, 4)
    .map((e) => ({
      ...e,
      date: e.start,
    }));
}

export async function getSiteContent(): Promise<SiteEditableContent> {
  // DB-first; falls back to JSON when site_content table is empty.
  const fromDb = await tryDbSiteContent();
  if (fromDb) return fromDb;

  const filePath = path.join(contentDirectory, 'site-content.json');
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = asObject(JSON.parse(fileContents));
    return {
      eventsIntro:
        typeof data.eventsIntro === 'string'
          ? data.eventsIntro
          : defaultSiteContent.eventsIntro,
      galleryIntro:
        typeof data.galleryIntro === 'string'
          ? data.galleryIntro
          : defaultSiteContent.galleryIntro,
      leadershipCurrentYear:
        typeof data.leadershipCurrentYear === 'string'
          ? data.leadershipCurrentYear
          : defaultSiteContent.leadershipCurrentYear,
      storyIntro:
        typeof data.storyIntro === 'string'
          ? data.storyIntro
          : defaultSiteContent.storyIntro,
      storyMissionTitle:
        typeof data.storyMissionTitle === 'string'
          ? data.storyMissionTitle
          : defaultSiteContent.storyMissionTitle,
      storyMissionBody:
        typeof data.storyMissionBody === 'string'
          ? data.storyMissionBody
          : defaultSiteContent.storyMissionBody,
      storyActivitiesTitle:
        typeof data.storyActivitiesTitle === 'string'
          ? data.storyActivitiesTitle
          : defaultSiteContent.storyActivitiesTitle,
      storyActivitiesIntro:
        typeof data.storyActivitiesIntro === 'string'
          ? data.storyActivitiesIntro
          : defaultSiteContent.storyActivitiesIntro,
      storyActivities: normalizeStoryActivities(data.storyActivities),
    };
  } catch {
    return defaultSiteContent;
  }
}
