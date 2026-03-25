import React from 'react';
import usePageMeta from '../hooks/usePageMeta';

export default function WebinarLive() {
  usePageMeta('Live Workshop | Healing Hearts', 'Watch the Healing Hearts live workshop.');

  return (
    <div className="pt-32 pb-24 px-6 text-center">
      <h1 className="font-drama italic text-4xl text-primary">Live Workshop</h1>
      <p className="font-sans text-foreground/60 mt-4">
        This page will show the live stream when the workshop begins.
      </p>
    </div>
  );
}
