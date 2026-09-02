import Image from "next/image";
import type { CSSProperties } from "react";
import type { MediaAsset } from "@/domain/models";
import { mediaClassificationLabel } from "@/lib/media-classification";
import { MediaAttribution } from "@/design-system";

interface MediaFrameProps {
  media: MediaAsset;
  className?: string;
  priority?: boolean;
  sizes?: string;
  showProvenance?: boolean;
  attributionMode?: "full" | "compact";
}

function GoogleAuthorAvatar({ src }: { src: string }) {
  // The validated transient provider URI is not a durable Next image asset.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" referrerPolicy="no-referrer" />;
}

function GooglePhotoAttribution({
  attribution,
  compact,
}: {
  attribution: NonNullable<MediaAsset["googleMapsAttribution"]>;
  compact: boolean;
}) {
  return (
    <figcaption className={`media-google-attribution${compact ? " media-google-attribution--compact" : ""}`}>
      {compact ? (
        <span translate="no">Google Maps</span>
      ) : (
        <>
          <a href={attribution.sourcePhotoUrl} target="_blank" rel="noreferrer" aria-label="Ver la foto original en Google Maps"><span translate="no">Google Maps</span></a>
          {attribution.authors.length ? <span className="media-google-authors">Foto: {attribution.authors.map((author, index) => <span className="media-google-author" key={`${author.displayName}-${index}`}>{index ? <span aria-hidden="true">, </span> : null}{author.avatarUrl ? <GoogleAuthorAvatar src={author.avatarUrl} /> : null}{author.profileUrl ? <a href={author.profileUrl} target="_blank" rel="noreferrer">{author.displayName}</a> : author.displayName}</span>)}</span> : null}
        </>
      )}
    </figcaption>
  );
}

export function MediaFrame({ media, className = "", priority = false, sizes = "(max-width: 768px) 100vw, 460px", showProvenance = true, attributionMode = "full" }: MediaFrameProps) {
  const external = media.src.startsWith("http://") || media.src.startsWith("https://") || media.src.startsWith("data:");
  const sourceLink = media.sourceUrl?.startsWith("http") ? media.sourceUrl : undefined;
  const provenance = mediaClassificationLabel(media);

  if (media.kind === "fallback") {
    const hue = media.sourceUrl ?? "#d5f43b";
    const name = media.alt.replace(/^Gráfico editorial de /, "");
    return (
      <figure className={`media-frame media-frame--fallback ${className}`.trim()} style={{ "--fallback-color": hue } as CSSProperties}>
        <span className="media-fallback-art" role="img" aria-label={media.alt}><b>{name}</b><i>Imagen pendiente</i></span>
        {showProvenance ? <MediaAttribution source={media.source ?? provenance} author={media.author} license={media.license} sourceUrl={sourceLink} /> : null}
      </figure>
    );
  }

  return (
    <figure className={`media-frame media-frame--${media.kind} ${className}`.trim()}>
      {external ? (
        // Validated transient/provider media uses the native element to avoid a durable host config.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media.src} alt={media.alt} referrerPolicy="no-referrer" style={{ objectPosition: media.focalPoint ?? "50% 50%" }} />
      ) : (
        <Image src={media.src} alt={media.alt} fill priority={priority} sizes={sizes} style={{ objectPosition: media.focalPoint ?? "50% 50%" }} />
      )}
      {showProvenance ? media.googleMapsAttribution ? <GooglePhotoAttribution attribution={media.googleMapsAttribution} compact={attributionMode === "compact"} /> : <MediaAttribution source={media.source ?? provenance} author={media.author} license={media.license} sourceUrl={sourceLink} /> : null}
    </figure>
  );
}
