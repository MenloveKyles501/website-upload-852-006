(function () {
  var video = document.querySelector('[data-player]');
  var cover = document.querySelector('[data-play-cover]');

  if (!video) {
    return;
  }

  var source = video.getAttribute('data-video-url');
  var hlsInstance = null;
  var started = false;

  function hideCover() {
    if (cover) {
      cover.classList.add('hidden');
    }
  }

  function attachNative() {
    if (video.getAttribute('src') !== source) {
      video.setAttribute('src', source);
    }
  }

  function attachHls() {
    if (!window.Hls || !window.Hls.isSupported()) {
      attachNative();
      return;
    }

    if (!hlsInstance) {
      hlsInstance = new window.Hls({
        maxBufferLength: 45,
        backBufferLength: 30,
        enableWorker: true
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    }
  }

  function startPlayback() {
    if (!source) {
      return;
    }

    if (!started) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        attachNative();
      } else {
        attachHls();
      }

      started = true;
    }

    hideCover();

    var playResult = video.play();

    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (!started || video.paused) {
      startPlayback();
    }
  });

  video.addEventListener('play', hideCover);
})();
