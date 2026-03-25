# Build Rescue Kit — Landing Page

## Task
Build the dedicated landing page for "The Conflict Rescue Kit" ($39 standalone bundle).
Currently `/rescue-kit` routes to `ComingSoon`. Replace with a full marketing page.

## Checklist

- [x] Create `src/pages/RescueKit.jsx` — full landing page with Hero, Problem/Empathy, What's Inside, Framework Previews, Testimonial, Pricing CTA, FAQ sections
- [x] Wire route in `src/App.jsx` — replaced ComingSoon import with RescueKit component
- [x] Update Programs.jsx "View Details" button for Conflict Rescue Kit to link to `/rescue-kit`
- [x] Verify build passes (`npm run build`) — clean build in 2.4s, 902KB bundle (pre-existing size)
- [x] Write output summary to `.dispatch/tasks/build-rescue-kit/output.md`
