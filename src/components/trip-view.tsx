"use client";

import { useState } from "react";
import type { TransferPlan, Trip } from "@/domain/models";
import { areaEs, es, titleEs } from "@/content/es";
import { formatSpanishShortDate, mapsUrl } from "@/lib/format";
import { ArrowIcon, CheckIcon, MapIcon, PlaneIcon, TicketIcon } from "./icons";
import { AppHeader } from "./app-header";
import { TripSectionCard } from "@/design-system";

interface TripViewProps { trip: Trip; onSaveTransfers: (transfers: TransferPlan[]) => void; }

export function TripView({ trip, onSaveTransfers }: TripViewProps) {
  const [anchorsOpen, setAnchorsOpen] = useState(false);
  const [editingTransfers, setEditingTransfers] = useState(false);
  const [draftTransfers, setDraftTransfers] = useState(trip.transfers);
  const anchors = trip.days.flatMap((day) => day.activities.filter((activity) => activity.level === "anchor" && activity.status === "confirmed").map((activity) => ({ day, activity })));

  function updateTransfer(id: string, field: keyof TransferPlan, value: string) {
    setDraftTransfers((items) => items.map((item) => item.id === id ? { ...item, [field]: value || undefined } : item));
  }

  function finishTransferEditing() {
    if (editingTransfers) onSaveTransfers(draftTransfers);
    setEditingTransfers((value) => !value);
  }

  return (
    <section className="trip-view" aria-labelledby="trip-title">
      <AppHeader context="trip" />
      <header className="trip-header">
        <div><p className="mono-label">6—13 agosto · Londres</p><h1 id="trip-title">El viaje,<br /><span>en claro.</span></h1><p>Todo lo fijo y logístico, sin exponer referencias privadas.</p></div>
        <div className="trip-facts"><span><b>{trip.days.length}</b> {es.trip.days}</span><span><b>{trip.travellers.length}</b> {es.trip.travellers}</span><span><b>{anchors.length}</b> confirmados</span></div>
      </header>

      <TripSectionCard className="travel-doc travel-doc--flight" index={`01 · ${es.trip.flights}`} title="Ida y vuelta" titleId="flights-title" action={<PlaneIcon />}>
        <div className="flight-list">{trip.travelSegments.map((segment) => <article className="flight-row" key={segment.id}><div><span>{segment.origin}</span><strong>{segment.startTime}</strong></div><span className="flight-line"><PlaneIcon /></span><div><span>{segment.destination}</span><strong>{segment.endTime}</strong></div><p>{formatSpanishShortDate(segment.date).toUpperCase()} · {segment.service}</p></article>)}</div>
      </TripSectionCard>

      <TripSectionCard className="travel-doc travel-doc--stay" index={`02 · ${es.trip.stay}`} title={trip.hotel.name} titleId="stay-title" action={<MapIcon />}>
        <p className="hotel-area">{es.trip.area}</p>
        <div className="stay-dates"><span><small>{es.trip.checkIn}</small>{formatSpanishShortDate(trip.hotel.checkInDate)} · {trip.hotel.checkInTime}</span><span><small>{es.trip.checkOut}</small>{formatSpanishShortDate(trip.hotel.checkOutDate)} · {trip.hotel.checkOutTime}</span></div>
        <a href={mapsUrl(trip.hotel.mapsQuery)} target="_blank" rel="noreferrer">{es.trip.maps} <ArrowIcon /></a>
      </TripSectionCard>

      <TripSectionCard className="travel-doc travel-doc--transfers" index={`03 · ${es.trip.transfers}`} title="Llegar y volver." titleId="transfers-title" action={<ArrowIcon />}>
        <div className="transfer-list">{draftTransfers.map((transfer) => <article key={transfer.id}><div className="transfer-route"><span>{transfer.label === "arrival" ? es.trip.arrival : es.trip.return}</span><strong>{transfer.origin} → {transfer.destination}</strong><small>{formatSpanishShortDate(transfer.date)} · {transfer.timeLabel}</small></div>{editingTransfers ? <div className="transfer-fields"><label><span>Tipo de transporte</span><input value={transfer.transportType ?? ""} onChange={(event) => updateTransfer(transfer.id, "transportType", event.target.value)} placeholder={es.trip.methodPending} /></label><label><span>Hora prevista</span><input type="time" value={transfer.plannedTime ?? ""} onChange={(event) => updateTransfer(transfer.id, "plannedTime", event.target.value)} /></label><label><span>Estación</span><input value={transfer.station ?? ""} onChange={(event) => updateTransfer(transfer.id, "station", event.target.value)} /></label><label><span>Observaciones</span><textarea rows={2} value={transfer.notes ?? ""} onChange={(event) => updateTransfer(transfer.id, "notes", event.target.value)} /></label></div> : <p>{transfer.transportType || es.trip.methodPending}{transfer.plannedTime ? ` · ${transfer.plannedTime}` : ""}<br />{transfer.notes}</p>}<a href={mapsUrl(transfer.mapsQuery ?? `${transfer.origin} to ${transfer.destination}`)} target="_blank" rel="noreferrer"><MapIcon /> Google Maps</a></article>)}</div>
        <button className="doc-action secondary-button" type="button" onClick={finishTransferEditing}>{editingTransfers ? es.trip.save : es.trip.edit}</button>
      </TripSectionCard>

      <TripSectionCard className="travel-doc travel-doc--bookings" index={`04 · ${es.trip.bookings}`} title="Reservas confirmadas" titleId="bookings-title" action={<TicketIcon />}>
        <div className="bookings-total"><strong>{anchors.length}</strong><span>puntos fijos<br />del viaje</span></div>
        <button className="anchors-toggle" type="button" aria-expanded={anchorsOpen} onClick={() => setAnchorsOpen((value) => !value)}>{anchorsOpen ? es.trip.anchorsClose : es.trip.anchorsOpen} <ArrowIcon /></button>
        {anchorsOpen ? <div className="booking-summary">{anchors.map(({ day, activity }) => <div key={activity.id}><CheckIcon /><span>{formatSpanishShortDate(day.date).toUpperCase()}</span><strong>{titleEs(activity.title)}</strong><small>{activity.startTime ?? es.trip.timeOpen} · {areaEs(activity.area) ?? es.activity.types[activity.type]}</small></div>)}</div> : null}
        <p className="privacy-note">{es.trip.privacy}</p>
      </TripSectionCard>
    </section>
  );
}
