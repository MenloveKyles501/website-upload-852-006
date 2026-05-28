import { H as Hls } from './hls.js';

export function initMoviePlayer(url) {
  var video = document.getElementById('movieVideo');
  var overlay = document.getElementById('playOverlay');
  var hls = null;
  var ready = false;

  if (!video || !overlay || !url) {
    return;
  }

  function load() {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(url);
      hls.attachMedia(video);
    }
  }

  function hideOverlay() {
    overlay.classList.add('is-hidden');
  }

  function showOverlay() {
    if (!video.ended && video.currentTime === 0) {
      overlay.classList.remove('is-hidden');
    }
  }

  function start() {
    load();
    hideOverlay();
    var playAction = video.play();

    if (playAction && typeof playAction.catch === 'function') {
      playAction.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  }

  overlay.addEventListener('click', start);

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener('play', hideOverlay);
  video.addEventListener('pause', showOverlay);
  video.addEventListener('ended', function () {
    overlay.classList.remove('is-hidden');
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
