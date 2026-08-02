"use client";

import { motion } from "motion/react";
import type { Activity } from "@/domain/models";
import { activityTimeLabelEs, activityTitleEs, areaEs, es } from "@/content/es";
import { mapsUrl } from "@/lib/format";
import { ArrowIcon, MapIcon } from "./icons";
import { MediaFrame } from "./media-frame";
import { StatusLabel } from "./status-label";

interface ActivityCardProps {
  activity: Activity;
  onOpen?: () => void;
  featured?: boolean;
  actionLabel?: string;
}

function timeFor(activity: Activity): string {
  if (activity.startTime && activity.endTime) return `${activity.startTime}—${activity.endTime}`;
  return activity.startTime ?? activityTimeLabelEs(activity.timeLabel) ?? es.activity.flexible;
}

export function ActivityCard({ activity, onOpen, featured = false, actionLabel }: ActivityCardProps) {
  if (featured) {
    return (
      <motion.article className="activity-card activity-card--sky" layoutId="sky-garden-card">
        <motion.div className="activity-media" layoutId="sky-garden-media">
          {activity.media ? <MediaFrame media={activity.media} priority sizes="(max-width: 680px) 100vw, 650px" /> : null}
          <span className="activity-photo-wash" aria-hidden="true" />
          <span className="media-stamp">LA CITY / ARRIBA</span>
        </motion.div>
        <div className="activity-card-body">
          <div className="activity-topline">
            <span className="activity-time">{timeFor(activity)}</span>
            <StatusLabel status={activity.status} timeNeedsVerification={activity.timeNeedsVerification} compact />
          </div>
          <button className="activity-main-action" type="button" onClick={onOpen} aria-label={`${es.activity.details}: ${activityTitleEs(activity)}`}>
            <span>
              <small>{es.activity.beforeTour}</small>
              <strong>{activityTitleEs(activity)}</strong>
              <em>{areaEs(activity.area)}</em>
            </span>
            <span className="round-arrow" aria-hidden="true"><ArrowIcon /></span>
          </button>
          {activity.mapsQuery ? (
            <a className="card-map-link" href={mapsUrl(activity.mapsQuery)} target="_blank" rel="noreferrer">
              <MapIcon /> {es.activity.maps}
            </a>
          ) : null}
        </div>
      </motion.article>
    );
  }

  return (
    <article className={`activity-card activity-card--${activity.level}`}>
      <div className="activity-type-mark" aria-hidden="true">
        <span>{activity.level === "anchor" ? "✓" : activity.level === "intention" ? "~" : "+"}</span>
      </div>
      <div className="activity-card-body activity-card-body--compact">
        <div className="activity-topline">
          <span className="activity-time">{timeFor(activity)}</span>
          <StatusLabel status={activity.status} timeNeedsVerification={activity.timeNeedsVerification} compact />
        </div>
        <h3>{activityTitleEs(activity)}</h3>
        <p>{activity.venue ?? areaEs(activity.area) ?? (activity.type === "meal" ? es.activity.chooseAround : (es.activity.types[activity.type] ?? activity.type))}</p>
        <div className="activity-footer">
          <span>{es.levels[activity.level]}</span>
          {activity.partySize ? <span>{es.activity.people(activity.partySize)}</span> : null}
        </div>
        {onOpen && actionLabel ? <button className="activity-inline-action" type="button" onClick={onOpen}>{actionLabel} <ArrowIcon /></button> : null}
      </div>
    </article>
  );
}
