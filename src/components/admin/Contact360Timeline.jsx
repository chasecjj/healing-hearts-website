import React from 'react';

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function TimelineItem({ dotClass, label, date, children }) {
  return (
    <div className="relative pl-8 pb-6 last:pb-0">
      {/* Connector line — rendered by parent */}
      <span className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${dotClass}`} />
      <div>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-medium text-foreground/80">{label}</span>
          {date && (
            <span className="text-xs text-foreground/40">{date}</span>
          )}
        </div>
        {children && (
          <div className="mt-1 text-xs text-foreground/60 space-y-0.5">{children}</div>
        )}
      </div>
    </div>
  );
}

export default function Contact360Timeline({ data, applicationCreatedAt }) {
  if (!data) {
    return (
      <p className="text-foreground/50 text-sm italic">No additional touchpoints found for this email.</p>
    );
  }

  return (
    <div className="relative">
      {/* Vertical connector line */}
      <div className="absolute left-[6px] top-2 bottom-2 w-px bg-primary/10" />

      {/* Application — always shown */}
      <TimelineItem
        dotClass="bg-primary"
        label="Application submitted"
        date={formatDate(applicationCreatedAt)}
      >
        <span>Intake form received.</span>
      </TimelineItem>

      {/* Spark Challenge */}
      {data.has_spark_signup && data.spark_signup && (
        <TimelineItem
          dotClass="bg-teal-500"
          label="Spark Challenge signup"
          date={data.spark_signup.last_email_sent_at ? `Last email ${formatDate(data.spark_signup.last_email_sent_at)}` : null}
        >
          <span>
            Day {data.spark_signup.current_day ?? 0}/14
            {data.spark_signup.source ? ` · Source: ${data.spark_signup.source}` : ''}
          </span>
          {data.spark_signup.unsubscribed && (
            <span className="text-red-500 font-medium">· Unsubscribed</span>
          )}
        </TimelineItem>
      )}

      {/* Webinar */}
      {data.has_webinar_registration && data.webinar_registration && (
        <TimelineItem
          dotClass="bg-purple-500"
          label="Webinar registration"
        >
          <span>
            Day-before reminder:{' '}
            {data.webinar_registration.reminder_day_before_sent ? '✓ sent' : 'not sent'}
            {' · '}
            Day-of reminder:{' '}
            {data.webinar_registration.reminder_day_of_sent ? '✓ sent' : 'not sent'}
          </span>
          {data.webinar_registration.unsubscribed && (
            <span className="text-red-500 font-medium">· Unsubscribed</span>
          )}
        </TimelineItem>
      )}

      {/* Rescue Kit */}
      {data.has_rescue_kit && data.rescue_kit_drip && (
        <TimelineItem
          dotClass="bg-amber-500"
          label="Rescue Kit drip"
        >
          <span>Day {data.rescue_kit_drip.current_day ?? 0} of drip sequence.</span>
          {data.rescue_kit_drip.unsubscribed && (
            <span className="text-red-500 font-medium">· Unsubscribed</span>
          )}
        </TimelineItem>
      )}

      {/* No extra touchpoints */}
      {!data.has_spark_signup && !data.has_webinar_registration && !data.has_rescue_kit && (
        <TimelineItem dotClass="bg-neutral-300" label="No additional touchpoints found" />
      )}
    </div>
  );
}
