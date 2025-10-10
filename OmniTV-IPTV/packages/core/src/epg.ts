import type { EpgEvent } from './types.js';

export interface EpgProvider {
  load(channelId: string): Promise<EpgEvent[]>;
}

type XmltvProgram = {
  $: { start: string; stop: string; channel: string };
  title: Array<{ _: string }>;
  desc?: Array<{ _: string }>;
};

type XmltvDocument = {
  tv: {
    programme: XmltvProgram[];
  };
};

export class SimpleEpgAdapter implements EpgProvider {
  constructor(private fetcher: (channelId: string) => Promise<unknown>) {}

  async load(channelId: string): Promise<EpgEvent[]> {
    const data = await this.fetcher(channelId);
    if (!data) return [];
    if (Array.isArray(data)) {
      return data.map((item: any, index) => ({
        id: item.id ?? `${channelId}-${index}`,
        title: item.title ?? 'Sem título',
        description: item.description,
        start: new Date(item.start ?? Date.now()),
        end: new Date(item.end ?? Date.now()),
      }));
    }
    if (typeof data === 'object' && 'tv' in (data as XmltvDocument)) {
      const programmes = (data as XmltvDocument).tv.programme ?? [];
      return programmes
        .filter((prog) => prog.$.channel === channelId)
        .map((prog) => ({
          id: `${channelId}-${prog.$.start}`,
          title: prog.title?.[0]?._ ?? 'Sem título',
          description: prog.desc?.[0]?._,
          start: new Date(prog.$.start),
          end: new Date(prog.$.stop),
        }));
    }
    return [];
  }
}
