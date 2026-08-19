/* eslint-disable @next/next/no-img-element */
import type { Attachment } from "@/lib/types";

export function AttachmentGallery({ attachments }: { attachments: Attachment[] }) {
  const available = attachments.filter((attachment) => attachment.signed_url);
  if (!available.length) return null;

  return (
    <div className="attachment-gallery">
      {available.map((attachment) => (
        <a
          key={attachment.id}
          href={attachment.signed_url}
          target="_blank"
          rel="noreferrer"
          className="attachment-gallery__item"
        >
          <img
            src={attachment.signed_url}
            alt={attachment.original_filename}
            loading="lazy"
          />
        </a>
      ))}
    </div>
  );
}
