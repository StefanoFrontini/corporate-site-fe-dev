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
    const container = containerRef.current;
    if (!container) return;

    // Funzione che applica le correzioni
    const fixAttributes = () => {
      const images = container.querySelectorAll('img');

      images.forEach(img => {
        // 1. Rimuovi role="presentation" se presente e alt è vuoto
        if (
          img.getAttribute('alt') === '' &&
          img.getAttribute('role') === 'presentation'
        ) {
          img.removeAttribute('role');
        }

        // 2. Arrotonda Height
        const height = img.getAttribute('height');
        if (height && height.includes('.')) {
          const roundedHeight = Math.round(parseFloat(height)).toString();
          // Evitiamo loop infiniti: cambiamo solo se il valore è diverso
          if (height !== roundedHeight) {
            img.setAttribute('height', roundedHeight);
          }
        }

        // 3. Arrotonda Width
        const width = img.getAttribute('width');
        if (width && width.includes('.')) {
          const roundedWidth = Math.round(parseFloat(width)).toString();
          if (width !== roundedWidth) {
            img.setAttribute('width', roundedWidth);
          }
        }
      });
    };

    // Eseguiamo subito una volta
    fixAttributes();

    // Creiamo un Observer che ascolta i cambiamenti nel DOM (es. lazy loading di Gatsby)
    const observer = new MutationObserver(() => {
      fixAttributes();
    });

    // Osserviamo il container per modifiche ai figli o agli attributi
    observer.observe(container, {
      childList: true, // Se Gatsby aggiunge/rimuove nodi
      subtree: true, // Anche in profondità
      attributes: true, // Se cambiano gli attributi (es. src o style)
    });

    // Pulizia quando il componente viene smontato
    return () => observer.disconnect();
  }, []);

  return (
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
  );
};
