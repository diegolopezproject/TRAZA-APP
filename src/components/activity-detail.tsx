"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Activity, Place } from "@/domain/models";
import { areaEs, es } from "@/content/es";
import { mapsUrl } from "@/lib/format";
import { ArrowIcon, CheckIcon, CloseIcon, MapIcon } from "./icons";
import { MediaFrame } from "./media-frame";
import { StatusLabel } from "./status-label";
import { navigationMotion } from "@/lib/motion";
import { useBackSwipe } from "@/lib/use-back-swipe";

interface ActivityDetailProps {
  activity: Activity;
  nearbyPlaces: Place[];
  onBack: () => void;
}

export function ActivityDetail({ activity, nearbyPlaces, onBack }: ActivityDetailProps) {
  const reducedMotion = useReducedMotion();
  const backSwipe = useBackSwipe(onBack);

  return (
    <motion.article
      className="detail-layer"
      data-navigation-scroll={`activity:${activity.id}`}
      aria-labelledby="detail-title"
      initial={reducedMotion ? { opacity: 0 } : { y: "100%" }}
      animate={reducedMotion ? { opacity: 1 } : { y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { y: "100%" }}
      transition={reducedMotion ? { duration: 0 } : navigationMotion.spring}
      style={{ x: backSwipe.x }}
    >
      <div className="app-back-swipe-zone" aria-hidden="true" {...backSwipe.zoneProps} />
      <header className="detail-toolbar">
        <button type="button" className="detail-back" onClick={onBack} aria-label={es.detail.backAria}>
          <CloseIcon /><span className="sr-only">{es.detail.back}</span>
        </button>
      </header>

      <motion.div className="detail-hero" layoutId="sky-garden-media">
        {activity.media ? <MediaFrame media={activity.media} priority sizes="(max-width: 680px) 100vw, 680px" /> : null}
        <span className="detail-photo-wash" aria-hidden="true" />
        <div className="detail-hero-type" aria-hidden="true">SKY<br />GARDEN</div>
        <div className="detail-hero-stamp">35 FENCHURCH ST<br />LA CITY</div>
      </motion.div>

      <div className="detail-content">
        <div className="detail-heading">
          <p className="detail-time">{activity.startTime}{activity.endTime ? `—${activity.endTime}` : ""} <span>{es.detail.timeVerify}</span></p>
          <h1 id="detail-title">Sky<br />Garden</h1>
          <div className="detail-heading-meta">
            <StatusLabel status={activity.status} />
            <span>{areaEs(activity.area)}</span>
          </div>
        </div>

        <section className="detail-section detail-about" aria-labelledby="about-title">
          <span className="section-index">01</span>
          <div>
            <p className="mono-label" id="about-title">{es.detail.about}</p>
            <p>{es.detail.aboutCopy}</p>
          </div>
        </section>

        <section className="detail-section detail-plan" aria-labelledby="plan-title">
          <span className="section-index">02</span>
          <div>
            <p className="mono-label" id="plan-title">{es.detail.plan}</p>
            <h2>{es.detail.planTitle.split("\n").map((line) => <span key={line}>{line}</span>)}</h2>
            <div className="plan-timeline">
              <span><b>{activity.startTime ?? "08:30"}</b> {es.detail.arrive}</span>
              <span><b>{activity.endTime ?? "09:30"}</b> {es.detail.leave}</span>
              <span><b>13:00</b> {es.detail.tour}</span>
            </div>
          </div>
        </section>

        <section className="location-block" aria-labelledby="location-title">
          <div className="location-grid" aria-hidden="true">
            <span className="location-pin"><MapIcon /></span>
            <span className="location-river" />
          </div>
          <div className="location-copy">
            <p className="mono-label" id="location-title">03 / {es.detail.location}</p>
            <h2>{es.detail.city.split("\n").map((line) => <span key={line}>{line}</span>)}</h2>
            <p>20 Fenchurch Street<br />London EC3M</p>
            <a className="primary-action" href={mapsUrl(activity.mapsQuery ?? activity.title)} target="_blank" rel="noreferrer">
              {es.activity.maps} <ArrowIcon />
            </a>
          </div>
        </section>

        <section className="detail-section booking-block" aria-labelledby="booking-title">
          <span className="section-index">04</span>
          <div>
            <p className="mono-label" id="booking-title">{es.detail.booking}</p>
            <h2>{es.detail.bookingTitle}</h2>
            <p className="booking-note"><CheckIcon /> {es.detail.bookingNote}</p>
          </div>
        </section>

        <section className="nearby-block" aria-labelledby="nearby-title">
          <div className="nearby-heading">
            <div><span>05</span><h2 id="nearby-title">{es.detail.nearby.split("\n").map((line) => <span key={line}>{line}</span>)}</h2></div>
            <span className="nearby-count">{es.detail.savedCount(nearbyPlaces.length)}</span>
          </div>
          <div className="nearby-list">
            {nearbyPlaces.map((place, index) => (
              <article className={`nearby-card nearby-card--${index + 1}`} key={place.id}>
                <div className="nearby-art" aria-hidden="true"><span>{String(index + 1).padStart(2, "0")}</span></div>
                <p>{es.saved.categories[place.category] ?? place.category}</p>
                <h3>{place.name}</h3>
                <span>{place.area ?? "Londres"}</span>
              </article>
            ))}
          </div>
        </section>

        <footer className="detail-footer">
          <p>{es.detail.ending.split("\n").map((line) => <span key={line}>{line}</span>)}</p>
          <button type="button" onClick={onBack}><ArrowIcon className="arrow-back" /> {es.detail.return}</button>
        </footer>
      </div>
    </motion.article>
  );
}
