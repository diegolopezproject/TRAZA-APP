"use client";

import { useState } from "react";
import type { TransferPlan, Trip } from "@/domain/models";
import { areaEs, es, titleEs } from "@/content/es";
import { formatSpanishShortDate, mapsUrl } from "@/lib/format";
import { ArrowIcon, CheckIcon, MapIcon, PlaneIcon, TicketIcon } from "./icons";

interface TripViewProps { trip: Trip; onSaveTransfers: (transfers: TransferPlan[]) => void; }

export function TripView({ trip, onSaveTransfers }: TripViewProps) {
  const [anchorsOpen, setAnchorsOpen] = useState(false);
  const [editingTransfers, setEditingTransfers] = useState(false);
  const [draftTransfers, setDraftTransfers] = useState(trip.transfers);
  const anchors = trip.days.flatMap((day) => day.activities.filter((activity) => activity.level === "anchor" && activity.status === "confirmed").map((activity) => ({ day, activity })));

  function updateTransfer(id: string, field: keyof TransferPlan, value: string) {
    setDraftTransfers((items) => items.map((item) => item.id === id ? { ...item, [field]: value || undefined } : item));
  }

  return (
    <section className="trip-view" aria-labelledby="trip-title">
      <header className="trip-header"><p className="mono-label">{es.trip.document}</p><h1 id="trip-title">Londres<br /><span>2026</span></h1><div className="trip-stamp">06—13<br />AGO</div><div className="trip-facts"><span><b>{trip.days.length}</b> {es.trip.days}</span><span><b>{trip.travellers.length}</b> {es.trip.travellers}</span><span><b>1</b> {es.trip.city}</span></div></header>

      <section className="travel-doc travel-doc--flight" aria-labelledby="flights-title">
        <div className="doc-kicker"><span>01 / {es.trip.flights}</span><PlaneIcon /></div><h2 id="flights-title">{es.trip.roundTrip.split("\n").map((line, index) => index === 1 ? <em key={line}>{line}</em> : <span key={line}>{line}</span>)}</h2>
        <div className="flight-list">{trip.travelSegments.map((segment) => <article className="flight-row" key={segment.id}><div><span>{segment.origin}</span><strong>{segment.startTime}</strong></div><span className="flight-line"><PlaneIcon /></span><div><span>{segment.destination}</span><strong>{segment.endTime}</strong></div><p>{formatSpanishShortDate(segment.date).toUpperCase()} / {segment.service}</p></article>)}</div>
      </section>

      <section className="travel-doc travel-doc--stay" aria-labelledby="stay-title">
        <div className="doc-kicker"><span>02 / {es.trip.stay}</span><MapIcon /></div><div className="hotel-key" aria-hidden="true"><span>IBIS</span><span>EAL</span></div><h2 id="stay-title">{trip.hotel.name}</h2><p className="hotel-area">{es.trip.area}</p><div className="stay-dates"><span><small>{es.trip.checkIn}</small>{formatSpanishShortDate(trip.hotel.checkInDate)} · {trip.hotel.checkInTime}</span><span><small>{es.trip.checkOut}</small>{formatSpanishShortDate(trip.hotel.checkOutDate)} · {trip.hotel.checkOutTime}</span></div><a href={mapsUrl(trip.hotel.mapsQuery)} target="_blank" rel="noreferrer">{es.trip.maps} <ArrowIcon /></a>
      </section>

      <section className="travel-doc travel-doc--transfers" aria-labelledby="transfers-title">
        <div className="doc-kicker"><span>03 / {es.trip.transfers}</span><ArrowIcon /></div><h2 id="transfers-title">{es.trip.transferTitle.split("\n").map((line) => <span key={line}>{line}</span>)}</h2>
        <div className="transfer-list">{draftTransfers.map((transfer) => <article key={transfer.id}><div className="transfer-route"><span>{transfer.label === "arrival" ? es.trip.arrival : es.trip.return}</span><strong>{transfer.origin} → {transfer.destination}</strong><small>{formatSpanishShortDate(transfer.date)} · {transfer.timeLabel}</small></div>{editingTransfers ? <div className="transfer-fields"><label><span>Tipo de transporte</span><input value={transfer.transportType ?? ""} onChange={(event) => updateTransfer(transfer.id, "transportType", event.target.value)} placeholder={es.trip.methodPending} /></label><label><span>Hora prevista</span><input type="time" value={transfer.plannedTime ?? ""} onChange={(event) => updateTransfer(transfer.id, "plannedTime", event.target.value)} /></label><label><span>Estación</span><input value={transfer.station ?? ""} onChange={(event) => updateTransfer(transfer.id, "station", event.target.value)} /></label><label><span>Observaciones</span><textarea rows={2} value={transfer.notes ?? ""} onChange={(event) => updateTransfer(transfer.id, "notes", event.target.value)} /></label></div> : <p>{transfer.transportType || es.trip.methodPending}{transfer.plannedTime ? ` · ${transfer.plannedTime}` : ""}<br />{transfer.notes}</p>}<a href={mapsUrl(transfer.mapsQuery ?? `${transfer.origin} to ${transfer.destination}`)} target="_blank" rel="noreferrer"><MapIcon /> Google Maps</a></article>)}</div>
        <button className="doc-action" type="button" onClick={() => { if (editingTransfers) onSaveTransfers(draftTransfers); setEditingTransfers((value) => !value); }}>{editingTransfers ? es.trip.save : es.trip.edit}</button>
      </section>

      <section className="travel-doc travel-doc--bookings" aria-labelledby="bookings-title">
        <div className="doc-kicker"><span>04 / {es.trip.bookings}</span><TicketIcon /></div><div className="bookings-total"><strong>{anchors.length}</strong><span>{es.trip.anchors.split("\n").map((line) => <span key={line}>{line}</span>)}</span></div><h2 id="bookings-title">{es.trip.fixed.split("\n").map((line) => <span key={line}>{line}</span>)}</h2>
        <button className="anchors-toggle" type="button" aria-expanded={anchorsOpen} onClick={() => setAnchorsOpen((value) => !value)}>{anchorsOpen ? es.trip.anchorsClose : es.trip.anchorsOpen} <ArrowIcon /></button>
        {anchorsOpen ? <div className="booking-summary">{anchors.map(({ day, activity }) => <div key={activity.id}><CheckIcon /><span>{formatSpanishShortDate(day.date).toUpperCase()}</span><strong>{titleEs(activity.title)}</strong><small>{activity.startTime ?? es.trip.timeOpen} · {areaEs(activity.area) ?? es.activity.types[activity.type]}</small></div>)}</div> : null}
        <p className="privacy-note">{es.trip.privacy}</p>
      </section>
    </section>
  );
}
