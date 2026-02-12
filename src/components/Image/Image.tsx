import { GatsbyImage, getImage, IGatsbyImageData } from 'gatsby-plugin-image';
import { IGatsbyImageParent } from 'gatsby-plugin-image/dist/src/components/hooks';
import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';

export type ImageProps = {
  data: Queries.ImageFragment | Queries.STRAPI__MEDIA;
  caption?: string | null;
  className?: string;
};

export const Image = ({
  data,
  caption,
  className,
}: ImageProps): ReactElement => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const presentationImage = containerRef.current.querySelector(
      'img[alt=""][role="presentation"]'
    );

    if (presentationImage) {
      presentationImage.removeAttribute('role');
    }

    const images = containerRef.current.querySelectorAll('img');

    images.forEach(img => {
      const height = img.getAttribute('height');
      const width = img.getAttribute('width');

      if (height && height.includes('.')) {
        img.setAttribute('height', Math.round(parseFloat(height)).toString());
      }

      if (width && width.includes('.')) {
        img.setAttribute('width', Math.round(parseFloat(width)).toString());
      }
    });
  }, []);

  return (
    <>
      <figure ref={containerRef} className={className}>
        <GatsbyImage
          image={
            getImage(data.localFile as IGatsbyImageParent) as IGatsbyImageData
          }
          alt={data.alternativeText || ''}
        />
        {caption && (
          <figcaption>
            <p>{caption}</p>
          </figcaption>
        )}
      </figure>
    </>
  );
};
