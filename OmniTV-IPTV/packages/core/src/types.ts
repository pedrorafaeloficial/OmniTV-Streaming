export interface XtreamCredentials {
  host: string;
  username: string;
  password: string;
}

export interface XtreamCategory {
  category_id: string;
  category_name: string;
  parent_id?: string;
}

export interface XtreamStream {
  stream_id: number;
  name: string;
  stream_icon?: string;
  epg_channel_id?: string;
  container_extension?: string;
  added?: string;
  custom_sid?: string;
  direct_source?: string;
}

export interface EpgEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
}

export interface EntitlementStatus {
  state: 'active' | 'trial' | 'past_due' | 'expired' | 'blocked';
  expiry?: string;
  allowed_streams: number;
}

export interface ParentalConfig {
  pinHash: string | null;
  pinSalt: string | null;
  invisibleMode: boolean;
  blockedCategories: string[];
  attempts: number;
  cooldownUntil?: number;
}

export interface SecureStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
