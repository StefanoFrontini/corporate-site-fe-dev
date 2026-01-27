import { gsap } from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import React, { useEffect, useRef, useState } from 'react';
import YouTube from 'react-youtube';
import { YouTubePlayer, Options } from 'youtube-player/dist/types';
import { Image } from '../Image';
import './Video.sass';
import { useI18next, useTranslation } from 'gatsby-plugin-react-i18next';

const youtubeParser = (url: string) => {
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : false;
};

type VideoProps = {
  image?: Queries.STRAPI__MEDIA | null;
  video: string;
  isSlideChange?: boolean;
  currentSlideIndex?: number;
};

const Video = ({
  image,
  video,
  isSlideChange,
  currentSlideIndex,
}: VideoProps) => {
  const { language } = useI18next();
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoActive, setVideoActive] = useState(false);
  const [videoPreview, setVideoPreview] = useState(true);
  const [videoInstance, setVideoInstance] = useState<YouTubePlayer | null>(
    null
  );

  const videoCode = video ? youtubeParser(video) : false;

  const videoRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handlePlay = () => {
    if (videoInstance) {
      videoInstance.playVideo();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();

      if (videoPreview && !videoActive) {
        handlePlayStart();
      } else if (videoActive && videoInstance) {
        if (isPlaying) {
          videoInstance.pauseVideo();
        } else {
          videoInstance.playVideo();
        }
      }
    }
  };

  const handlePlayStart = () => {
    handlePlay();
    setVideoPreview(false);
    setVideoActive(true);
    videoInstance?.unMute();

    setTimeout(() => {
      buttonRef.current?.focus();
    }, 0);
  };

  const handleStop = () => {
    if (videoInstance) {
      videoInstance.pauseVideo();
    }
  };

  useEffect(() => {
    if (isSlideChange && currentSlideIndex !== 0) {
      handleStop();
      setVideoActive(false);
    }
  }, [isSlideChange, currentSlideIndex]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    let ctx: gsap.Context | null = null;

    if (videoInstance !== null) {
      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: videoRef.current,
          start: 'top 60%',
          end: 'bottom 40%',
          onEnter: () => {
            if (videoPreview) handlePlay();
          },
          onEnterBack: () => {
            if (videoPreview) handlePlay();
          },
          onLeave: () => {
            handleStop();
          },
          onLeaveBack: () => {
            handleStop();
          },
        });
      }, videoRef);
    }

    return () => ctx?.revert();
  }, [videoInstance, videoPreview]);

  const playerOptions: Options = {
    playerVars: {
      autoplay: 0,
      hl: language,
      rel: 0,
      cc_load_policy: 1,
      color: 'white',
      iv_load_policy: 3,
      modestbranding: 1,
      //@ts-expect-error this props are missing in the type definition but used
      showInfo: 0,
      mute: 1,
      cc_lang_pref: language,
    },
  };

  return (
    <figure className="video" ref={videoRef}>
      {videoCode && (
        <YouTube
          videoId={videoCode}
          id={`video-${videoCode}`}
          className="video__frame"
          opts={playerOptions}
          title={t('youtubeVideo')}
          onReady={event => setVideoInstance(event.target)}
          onStateChange={e => setIsPlaying(e.data === 1 ? true : false)}
          onEnd={() => setVideoActive(false)}
        />
      )}

      {videoPreview && !isPlaying && !videoActive && image?.localFile && (
        <>{image && <Image className="video__picture" data={image} />}</>
      )}

      {videoPreview && !videoActive && (
        <>
          <div className="video__curtain"></div>
          <button
            className="video__play"
            aria-label={t('playVideo')}
            onClick={handlePlayStart}
            onKeyDown={handleKeyDown}
          >
            play
          </button>
        </>
      )}

      {!videoPreview && videoActive && (
        <button
          ref={buttonRef}
          className="video__control"
          aria-label={isPlaying ? t('pauseVideo') : t('resumeVideo')}
          onClick={() => (isPlaying ? handleStop() : handlePlay())}
          onKeyDown={handleKeyDown}
        >
          {isPlaying ? 'pause' : 'play'}
        </button>
      )}
    </figure>
  );
};

export default Video;
