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
    const image = containerRef.current.querySelector(
      'img[alt=""][role="presentation"]'
    );

    if (image) {
      image.removeAttribute('role');
    }
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
