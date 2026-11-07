'use client';

import type { PublishCopy } from '@/domain/types';
import { CopyButton } from '../ui/CopyButton';

function Row({ text }: { text: string }) {
  return (
    <li className="flex items-start justify-between gap-3 rounded-[4px] border border-line bg-base p-3">
      <span className="text-sm">{text}</span>
      <CopyButton text={text} />
    </li>
  );
}

function Block({ title, copyText, children }: { title: string; copyText?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">{title}</h4>
        {copyText && <CopyButton text={copyText} label="Copiar tudo" />}
      </div>
      {children}
    </div>
  );
}

/** Títulos, descrição e tags prontos para copiar para YouTube e TikTok. */
export function PublishResults({ copy }: { copy: PublishCopy }) {
  const tags = copy.youtube.tags.join(', ');
  const hashtags = copy.tiktok.hashtags.join(' ');

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="flex flex-col gap-5 rounded-[4px] bg-surface p-5">
        <h3 className="text-lg font-extrabold">YouTube</h3>
        <Block title="Títulos">
          <ul className="flex flex-col gap-2">
            {copy.youtube.titles.map((t) => (
              <Row key={t} text={t} />
            ))}
          </ul>
        </Block>
        <Block title="Descrição" copyText={copy.youtube.description}>
          <p className="whitespace-pre-wrap rounded-[4px] border border-line bg-base p-3 text-sm">
            {copy.youtube.description}
          </p>
        </Block>
        <Block title="Tags" copyText={tags}>
          <p className="rounded-[4px] border border-line bg-base p-3 font-mono text-xs">{tags}</p>
        </Block>
      </section>

      <section className="flex flex-col gap-5 rounded-[4px] bg-surface p-5">
        <h3 className="text-lg font-extrabold">TikTok</h3>
        <Block title="Legendas">
          <ul className="flex flex-col gap-2">
            {copy.tiktok.captions.map((c) => (
              <Row key={c} text={c} />
            ))}
          </ul>
        </Block>
        <Block title="Hashtags" copyText={hashtags}>
          <p className="rounded-[4px] border border-line bg-base p-3 font-mono text-xs">{hashtags}</p>
        </Block>
      </section>
    </div>
  );
}
