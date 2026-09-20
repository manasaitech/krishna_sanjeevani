import React, { useState, useEffect } from "react";
import defaultArtwork from "@/assets/art-devotional.webp";
import { cn } from "@/lib/utils";

export const DEFAULT_ARTWORK = defaultArtwork;

export interface ArtworkProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  fallback?: string;
  songTitle?: string;
  className?: string;
}

/**
 * Resolves a song artwork URL with a robust fallback to the default Krishna Sanjeevani artwork.
 */
export function resolveArtwork(art?: string | null, fallback: string = DEFAULT_ARTWORK): string {
  if (!art || typeof art !== "string" || !art.trim()) {
    return fallback;
  }
  return art;
}

/**
 * Unified, accessible Artwork component for Krishna Sanjeevani.
 * Automatically falls back to branded Vedic artwork on missing src, invalid URL, or network error.
 */
export function Artwork({
  src,
  fallback = DEFAULT_ARTWORK,
  alt,
  songTitle,
  className,
  onError,
  ...props
}: ArtworkProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(() => resolveArtwork(src, fallback));
  const [hasError, setHasError] = useState<boolean>(() => !src || !src.trim());

  useEffect(() => {
    const resolved = resolveArtwork(src, fallback);
    setCurrentSrc(resolved);
    setHasError(!src || !src.trim());
  }, [src, fallback]);

  const effectiveAlt = hasError
    ? "Krishna Sanjeevani"
    : alt || (songTitle ? songTitle : "Krishna Sanjeevani");

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (currentSrc !== fallback) {
      setCurrentSrc(fallback);
      setHasError(true);
    }
    if (onError) {
      onError(e);
    }
  };

  return (
    <img
      {...props}
      src={currentSrc}
      alt={effectiveAlt}
      className={cn("object-cover", className)}
      onError={handleError}
    />
  );
}

export default Artwork;
