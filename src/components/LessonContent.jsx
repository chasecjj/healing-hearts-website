import React from 'react';
import { Heart, Lightbulb, AlertCircle, BookOpen, PenLine, Play } from 'lucide-react';
import AudioPlayer from '../portal/AudioPlayer';

const MuxVideoPlayer = React.lazy(() =>
  import('../portal/MuxVideoPlayer')
);

// ─── Block Renderers (pure React, no dangerouslySetInnerHTML) ───

const CALLOUT_ICONS = {
  heart: Heart,
  lightbulb: Lightbulb,
  alert: AlertCircle,
  book: BookOpen,
};

function HeadingBlock({ content }) {
  return (
    <h2 className="font-drama italic text-3xl text-primary mt-10 mb-4 first:mt-0">
      {content}
    </h2>
  );
}

function SubheadingBlock({ content }) {
  return (
    <h3 className="font-outfit font-bold text-xl text-primary mt-8 mb-3">
      {content}
    </h3>
  );
}

function TextBlock({ content }) {
  return (
    <p className="font-sans font-light text-foreground/80 leading-relaxed mb-4">
      {content}
    </p>
  );
}

function BoldTextBlock({ content }) {
  return (
    <p className="font-sans font-semibold text-foreground mb-4">
      {content}
    </p>
  );
}

function CalloutBlock({ icon, content }) {
  const IconComponent = CALLOUT_ICONS[icon] || Lightbulb;
  return (
    <div className="bg-primary/5 border-l-4 border-primary rounded-2xl p-6 my-6 flex gap-4 items-start">
      <IconComponent className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
      <p className="font-sans text-foreground/80 leading-relaxed">{content}</p>
    </div>
  );
}

function ExerciseBlock({ title, prompt, steps }) {
  return (
    <div className="border-2 border-accent/20 rounded-2xl p-6 my-6 bg-accent/5">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-5 h-5 text-accent" />
        <h4 className="font-outfit font-bold text-lg text-accent">{title}</h4>
      </div>
      {prompt && (
        <p className="font-sans text-foreground/80 leading-relaxed mb-4">
          {prompt}
        </p>
      )}
      {steps && steps.length > 0 && (
        <ol className="space-y-3 ml-1">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="font-outfit font-bold text-accent/70 text-sm mt-0.5 flex-shrink-0">
                {i + 1}.
              </span>
              <p className="font-sans text-foreground/70 leading-relaxed text-sm">
                {step}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function QuoteBlock({ content, attribution }) {
  return (
    <blockquote className="border-l-4 border-accent/30 pl-6 py-4 my-8">
      <p className="font-drama italic text-xl text-foreground/70 leading-relaxed">
        "{content}"
      </p>
      {attribution && (
        <cite className="block mt-3 font-outfit text-sm text-accent not-italic">
          — {attribution}
        </cite>
      )}
    </blockquote>
  );
}

function ListBlock({ items, ordered }) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag className="space-y-2 my-4 ml-1">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          {ordered ? (
            <span className="font-outfit font-bold text-primary/50 text-sm mt-0.5 flex-shrink-0">
              {i + 1}.
            </span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
          )}
          <span className="font-sans font-light text-foreground/80 leading-relaxed">
            {item}
          </span>
        </li>
      ))}
    </Tag>
  );
}

function DividerBlock() {
  return <hr className="border-t border-primary/10 my-8" />;
}

function ReflectionBlock({ content }) {
  return (
    <div className="bg-accent/5 border-l-4 border-accent rounded-2xl p-6 my-6 flex gap-4 items-start">
      <PenLine className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
      <div>
        <h4 className="font-outfit font-bold text-sm text-accent uppercase tracking-wider mb-2">
          Reflection
        </h4>
        <p className="font-sans text-foreground/80 leading-relaxed">{content}</p>
      </div>
    </div>
  );
}

function VideoBlock({ playback_id, title, caption }) {
  if (!playback_id) return null;
  return (
    <div className="my-8">
      <React.Suspense
        fallback={
          <div className="bg-neutral-100 rounded-2xl aspect-video animate-pulse flex items-center justify-center">
            <Play className="w-8 h-8 text-foreground/20" />
          </div>
        }
      >
        <MuxVideoPlayer playbackId={playback_id} title={title || 'Video'} />
      </React.Suspense>
      {caption && (
        <p className="text-sm text-foreground/40 italic mt-3 text-center font-sans">
          {caption}
        </p>
      )}
    </div>
  );
}

function AudioBlock({ src, playback_id, title }) {
  // Use MP4 rendition — native <audio> doesn't support HLS on Chrome/Firefox
  const audioSrc = src || (playback_id ? `https://stream.mux.com/${playback_id}/low.mp4` : null);
  if (!audioSrc) return null;
  return (
    <div className="my-6">
      <AudioPlayer src={audioSrc} title={title} />
    </div>
  );
}

// ─── Graceful fallback for unknown block types ──────────────────

function FallbackBlock({ content }) {
  if (!content) return null;
  return (
    <p className="font-sans font-light text-foreground/60 leading-relaxed mb-4">
      {content}
    </p>
  );
}

// ─── Block type → Component mapping ─────────────────────────────

const BLOCK_COMPONENTS = {
  heading: HeadingBlock,
  subheading: SubheadingBlock,
  text: TextBlock,
  bold_text: BoldTextBlock,
  callout: CalloutBlock,
  exercise: ExerciseBlock,
  quote: QuoteBlock,
  list: ListBlock,
  divider: DividerBlock,
  reflection: ReflectionBlock,
  video: VideoBlock,
  audio: AudioBlock,
};

// ─── Main Component ─────────────────────────────────────────────

export default function LessonContent({ contentJson }) {
  if (!contentJson || !contentJson.blocks || contentJson.blocks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="font-sans text-foreground/40 text-sm">
          Lesson content is being prepared.
        </p>
      </div>
    );
  }

  return (
    <div className="lesson-content">
      {contentJson.blocks.map((block, index) => {
        const Component = BLOCK_COMPONENTS[block.type];
        if (!Component && import.meta.env.DEV) {
          console.warn(`[LessonContent] Unknown block type: "${block.type}" at index ${index}`);
        }
        const Renderer = Component || FallbackBlock;
        return <Renderer key={index} {...block} />;
      })}
    </div>
  );
}
