/**
 * FrameworkCard — single framework card on the Rescue surface.
 *
 * Spec: portal-rescue-kit-v1 wave-3.1-frameworks-spec §5.
 *
 * Composition: wraps Lane DS <RescueCard /> (which already provides the
 * card chrome, hover lift, reduced-motion compliance, focus ring, and
 * aria-label-as-button semantics per primitives-spec §6). FrameworkCard's
 * job is to translate a `framework` record into RescueCard props +
 * route-navigation onClick.
 *
 * Accessibility (spec §5):
 *   - The entire card is a single interactive element (via RescueCard's
 *     <button> branch when onClick is provided).
 *   - aria-label: "Open ${framework.title}" — RescueCard surfaces this.
 *   - No nested interactive elements.
 *
 * Tier-1 cards (Emergency Mini-Kit) render with tier="emergency" — slightly
 * warmer --pt-elevation-2 background per primitives-spec §6.3.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import RescueCard from './RescueCard';

/**
 * @param {object} props
 * @param {{
 *   id: string,
 *   title: string,
 *   subtitle: string,
 *   icon: React.ComponentType,
 *   route: string,
 *   tier: 1|2,
 *   contentStatus: 'available'|'w4-pending',
 *   traumaFlag: 'LOW'|'MAYBE'|'MEDIUM'|'HIGH',
 * }} props.framework
 */
export default function FrameworkCard({ framework }) {
  const navigate = useNavigate();

  if (!framework) return null;

  const handleClick = () => {
    navigate(framework.route);
  };

  return (
    <RescueCard
      title={framework.title}
      subtitle={framework.subtitle}
      icon={framework.icon}
      onClick={handleClick}
      tier={framework.tier === 1 ? 'emergency' : 'standard'}
      ariaLabel={`Open ${framework.title}`}
    />
  );
}
