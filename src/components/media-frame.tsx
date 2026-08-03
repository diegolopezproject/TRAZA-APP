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
}

export function MediaFrame({ media, className = "", priority = false, sizes = "(max-width: 768px) 100vw, 460px", showProvenance = true }: MediaFrameProps) {
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
        // User-provided media remains local data; the native element avoids a remote host allow-list.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media.src} alt={media.alt} style={{ objectPosition: media.focalPoint ?? "50% 50%" }} />
      ) : (
        <Image src={media.src} alt={media.alt} fill priority={priority} sizes={sizes} style={{ objectPosition: media.focalPoint ?? "50% 50%" }} />
      )}
      {showProvenance ? <MediaAttribution source={media.source ?? provenance} author={media.author} license={media.license} sourceUrl={sourceLink} /> : null}
    </figure>
  );
}
