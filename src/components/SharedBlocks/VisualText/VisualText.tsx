import classNames from 'classnames';
import React, { useRef } from 'react';
import { useRevealTextAnimation } from '../../../hooks';
import { Cta } from '../../../partials/Cta';
import { BackgroundGraphics } from '../../BackgroundGraphics';
import { Image } from '../../Image';
import { Body } from '../../Remark/Body';
import { Video } from '../../Video';
import { useLocation } from '@reach/router';

import './VisualText.sass';

type VisualSize = 'Small' | 'Half' | 'Big' | 'Full';

export const VisualText = ({
  eyelet,
  title,
  body,
  image,
  caption,
  visualWidth,
  reverseOrder,
  link,
  ctaText,
  reveal,
  backgroundAnimation,
  youtubeVideo,
  backgroundColor,
}: Queries.Blocks_STRAPI__COMPONENT_SHARED_BLOCK_VISUAL_TEXT_Fragment) => {
  const visualSize = (visualWidth as VisualSize) || 'Half';

  const elementRef = useRef(null);

  useRevealTextAnimation({ elementRef });

  const columns: Record<
    VisualSize,
    { visual: string; content: string; textOnly: string }
  > = {
    Small: {
      visual: `col-md-${reverseOrder ? 5 : 4} offset-md-1`,
      content: `col-md-${reverseOrder ? 4 : 5} offset-md-1`,
      textOnly: `col-md-3 offset-md-1`,
    },
    Half: {
      visual: `col-md-5${reverseOrder ? '' : ' offset-md-1'}`,
      content: `col-md-5${reverseOrder ? ' offset-md-1' : ''}`,
      textOnly: `col-md-5${reverseOrder ? ' offset-md-1' : ''}`,
    },
    Big: {
      visual: `col-md-6`,
      content: `col-md-6 col-lg-5`,
      textOnly: `col-md-10 offset-md-1 col-lg-8 offset-lg-2`,
    },
    Full: {
      visual: `col-md-9 offset-md-1`,
      content: `col-md-5 offset-md-5`,
      textOnly: `col-lg-10 offset-lg-1`,
    },
  };

  const fullWidthLayout = visualSize === 'Full';

  const sectionId = title?.replaceAll(' ', '-').toLocaleLowerCase();

  const { left, top, size } = backgroundAnimation || {};

  const VisualBody = () =>
    reveal ? (
      <div className="col-12 col-md-10 offset-md-1">
        <Body
          forwardRef={elementRef}
          className={classNames(reveal && 'reveal-mode')}
          data={body}
        />
      </div>
    ) : (
      <Body forwardRef={elementRef} data={body} />
    );

  const VisualCtas = () => <Cta label={ctaText} href={link} />;

  const VisualTitle = () => {
    const { pathname } = useLocation();

    const isHomepage =
      pathname === '/' || pathname === '/it/' || pathname === '/en/homepage/';

    const renderHeading = isHomepage ? (
      <h4 className="h1 --primary">{title}</h4>
    ) : (
      <h2 className="h1">{title}</h2>
    );

    return visualSize === 'Small' ? <h4>{title}</h4> : renderHeading;
  };

  const VisualMedia = () => (
    <>
      {fullWidthLayout && (
        <div className="col-12 col-md-10 offset-md-1">
          {eyelet && <h4>{eyelet}</h4>}
          {title && <VisualTitle />}
        </div>
      )}
      <div className={`col-12 ${columns[visualSize]?.visual}`}>
        <div className="block__visual">
          {youtubeVideo ? (
            <Video
              video={youtubeVideo}
              image={(image as Queries.STRAPI__MEDIA) || null}
            />
          ) : (
            image && (
              <Image data={image as Queries.STRAPI__MEDIA} caption={caption} />
            )
          )}
        </div>
      </div>
      <div className={`col-12 ${columns[visualSize].content}`}>
        <div className="block__content">
          {!fullWidthLayout && eyelet && <h4>{eyelet}</h4>}
          {!fullWidthLayout && title && <VisualTitle />}
          {body && <VisualBody />}
          {link && ctaText && <VisualCtas />}
        </div>
      </div>
    </>
  );

  const TextOnly = () => (
    <>
      <div className={`col-12 ${columns[visualSize].textOnly}`}>
        {eyelet && <h3 className="h4">{eyelet}</h3>}
        {title && <h2 className="h1">{title}</h2>}
        {body && <VisualBody />}
        {link && ctaText && <VisualCtas />}
      </div>
    </>
  );

  return (
    <section
      className={classNames(
        'block ',
        image ? '--block-visual-text' : '--block-text',
        backgroundColor && '--has-bg-color',
        !(body || title || eyelet) && youtubeVideo && '--only-video'
      )}
      style={{ backgroundColor: backgroundColor || 'transparent' }}
      id={sectionId}
    >
      {!(title || eyelet) && (image || youtubeVideo) && (
        <h2 className="sr-only">
          {youtubeVideo ? 'Video YouTube' : 'Immagine'}
        </h2>
      )}
      <BackgroundGraphics {...{ left, top, size }} />
      <div className="container-fluid">
        <div
          className={classNames(
            `row align-items-center`,
            reverseOrder && 'flex-row-reverse justify-content-end'
          )}
        >
          {image || youtubeVideo ? <VisualMedia /> : <TextOnly />}
        </div>
      </div>
    </section>
  );
};
