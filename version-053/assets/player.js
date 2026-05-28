function initMoviePlayer(sourceUrl) {
  var video = document.getElementById("movie-player");
  var button = document.getElementById("start-layer");
  if (!video || !sourceUrl) {
    return;
  }
  var attached = false;

  function attachSource() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      return;
    }
    video.src = sourceUrl;
  }

  function begin() {
    attachSource();
    if (button) {
      button.classList.add("hidden");
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener("click", begin);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      begin();
    }
  });

  video.addEventListener("play", function () {
    if (button) {
      button.classList.add("hidden");
    }
  });
}
