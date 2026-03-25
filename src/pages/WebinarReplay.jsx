import React from 'react';
import usePageMeta from '../hooks/usePageMeta';

export default function WebinarReplay() {
  usePageMeta('Workshop Replay | Healing Hearts', 'Watch the Healing Hearts workshop replay.');

  return (
    <div className="pt-32 pb-24 px-6 text-center">
      <h1 className="font-drama italic text-4xl text-primary">Workshop Replay</h1>
      <p className="font-sans text-foreground/60 mt-4">
        The replay will be available here after the live workshop.
      </p>
    </div>
  );
}
