import Image from "next/image";
import type { MediaAsset } from "@/domain/models";

interface MediaFrameProps {
  media: MediaAsset;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export function MediaFrame({ media, className = "", priority = false, sizes = "(max-width: 768px) 100vw, 460px" }: MediaFrameProps) {
  const external = media.src.startsWith("http://") || media.src.startsWith("https://") || media.src.startsWith("data:");
  return (
    <figure className={`media-frame media-frame--${media.kind} ${className}`.trim()}>
      {external ? (
        // User-provided media remains local data; the native element avoids a remote host allow-list.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media.src} alt={media.alt} style={{ objectPosition: media.focalPoint ?? "50% 50%" }} />
      ) : (
        <Image src={media.src} alt={media.alt} fill priority={priority} sizes={sizes} style={{ objectPosition: media.focalPoint ?? "50% 50%" }} />
      )}
    </figure>
  );
}
