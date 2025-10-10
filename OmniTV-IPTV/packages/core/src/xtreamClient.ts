import fetch from 'cross-fetch';
import { buildUrl, withTimeout } from './utils.js';
import type { XtreamCredentials, XtreamCategory, XtreamStream, EpgEvent } from './types.js';

const DEFAULT_TIMEOUT = 8000;

type XtreamResponse<T> = {
  user_info?: {
    auth: number;
    status?: string;
    message?: string;
  };
  [key: string]: unknown;
} & T;

export class XtreamClient {
  constructor(private creds: XtreamCredentials) {}

  private async get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
    const url = buildUrl(this.creds.host, path, {
      username: this.creds.username,
      password: this.creds.password,
      ...params,
    });
    const response = await withTimeout(fetch(url), DEFAULT_TIMEOUT, 'Xtream timeout');
    if (!response.ok) {
      throw new Error(`Xtream error ${response.status}`);
    }
    return (await response.json()) as T;
  }

  get credentials(): XtreamCredentials {
    return this.creds;
  }

  buildStreamUrl(type: 'live' | 'vod' | 'series', streamId: number, extension = 'm3u8'): string {
    const folder = type === 'live' ? 'live' : type === 'vod' ? 'movie' : 'series';
    return `${this.creds.host.replace(/\/$/, '')}/${folder}/${this.creds.username}/${this.creds.password}/${streamId}.${extension}`;
  }

  async ping(): Promise<boolean> {
    const data = await this.get<XtreamResponse<Record<string, unknown>>>('player_api.php');
    if (!data.user_info) throw new Error('Resposta inválida do Xtream');
    if (data.user_info.auth !== 1) {
      throw new Error(data.user_info.status ?? data.user_info.message ?? 'Credenciais inválidas');
    }
    return true;
  }

  liveCategories(): Promise<XtreamCategory[]> {
    return this.get('player_api.php', { action: 'get_live_categories' });
  }

  liveStreams(categoryId?: string): Promise<XtreamStream[]> {
    return this.get('player_api.php', {
      action: 'get_live_streams',
      category_id: categoryId,
    });
  }

  vodCategories(): Promise<XtreamCategory[]> {
    return this.get('player_api.php', { action: 'get_vod_categories' });
  }

  vodStreams(categoryId?: string): Promise<XtreamStream[]> {
    return this.get('player_api.php', {
      action: 'get_vod_streams',
      category_id: categoryId,
    });
  }

  vodInfo(id: number): Promise<Record<string, unknown>> {
    return this.get('player_api.php', {
      action: 'get_vod_info',
      vod_id: id,
    });
  }

  seriesCategories(): Promise<XtreamCategory[]> {
    return this.get('player_api.php', { action: 'get_series_categories' });
  }

  seriesList(categoryId?: string): Promise<XtreamStream[]> {
    return this.get('player_api.php', {
      action: 'get_series',
      category_id: categoryId,
    });
  }

  seriesInfo(id: number): Promise<Record<string, unknown>> {
    return this.get('player_api.php', {
      action: 'get_series_info',
      series_id: id,
    });
  }

  epg(channelId: number, limit = 10): Promise<Record<string, EpgEvent[]>> {
    return this.get('player_api.php', {
      action: 'get_short_epg',
      stream_id: channelId,
      limit,
    });
  }
}
