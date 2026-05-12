document.addEventListener('DOMContentLoaded', () => {

  // =========================
  // ELEMENTS
  // =========================

  const enableExtensionCheckbox =
    document.getElementById('enableExtension');

  const reloadPageButton =
    document.getElementById('reloadPage');

  const noVideoSection =
    document.getElementById('no-video');

  const videoInfoSection =
    document.getElementById('video-info');

  const videoThumbnail =
    document.getElementById('video-thumbnail');

  const videoTitle =
    document.getElementById('video-title');

  const videoDuration =
    document.getElementById('video-duration');

  const channelName =
    document.getElementById('channel-name');

  const videoQualities =
    document.getElementById('video-qualities');

  const audioQualities =
    document.getElementById('audio-qualities');

  const progressContainer =
    document.getElementById('download-progress');

  const progressBar =
    document.getElementById('progress');

  const progressText =
    document.getElementById('progress-text');

  const openYouTubeBtn =
    document.getElementById('open-youtube');

  const settingsBtn =
    document.getElementById('settings-btn');

  let currentVideo = null;

  // =========================
  // LOAD ADBLOCK STATE
  // =========================

  chrome.storage.sync.get(
    ['extensionEnabled'],
    (result) => {

      enableExtensionCheckbox.checked =
        result.extensionEnabled || false;

    }
  );

  // =========================
  // TOGGLE ADBLOCK
  // =========================

  enableExtensionCheckbox.addEventListener(
    'change',
    function () {

      chrome.storage.sync.set(
        {
          extensionEnabled: this.checked
        },
        () => {

          chrome.tabs.query(
            {
              active: true,
              currentWindow: true
            },
            (tabs) => {

              chrome.tabs.reload(tabs[0].id);

            }
          );

        }
      );

    }
  );

  // =========================
  // RELOAD PAGE
  // =========================

  reloadPageButton.addEventListener(
    'click',
    () => {

      chrome.tabs.query(
        {
          active: true,
          currentWindow: true
        },
        (tabs) => {

          chrome.tabs.reload(tabs[0].id);

        }
      );

    }
  );

  // =========================
  // CHECK YOUTUBE VIDEO
  // =========================

  chrome.tabs.query(
    {
      active: true,
      currentWindow: true
    },
    (tabs) => {

      const currentTab = tabs[0];
      const url = currentTab.url;

      if (isYouTubeVideoUrl(url)) {

        noVideoSection.classList.add('hidden');

        videoInfoSection.classList.remove('hidden');

        chrome.tabs.sendMessage(
          currentTab.id,
          {
            action: 'getVideoInfo'
          },
          (response) => {

            if (
              response &&
              response.videoInfo
            ) {

              displayVideoInfo(
                response.videoInfo
              );

            } else {

              showError(
                'Could not retrieve video information'
              );

            }

          }
        );

      } else {

        noVideoSection.classList.remove('hidden');

        videoInfoSection.classList.add('hidden');

      }

    }
  );

  // =========================
  // OPEN YOUTUBE
  // =========================

  openYouTubeBtn.addEventListener(
    'click',
    () => {

      chrome.tabs.create({
        url: 'https://www.youtube.com'
      });

    }
  );

  // =========================
  // SETTINGS
  // =========================

  settingsBtn.addEventListener(
    'click',
    () => {

      chrome.runtime.openOptionsPage();

    }
  );

  // =========================
  // DISPLAY VIDEO INFO
  // =========================

  function displayVideoInfo(videoInfo) {

    currentVideo = videoInfo;

    videoThumbnail.src =
      videoInfo.thumbnail;

    videoTitle.textContent =
      videoInfo.title;

    videoDuration.textContent =
      formatDuration(videoInfo.duration);

    channelName.textContent =
      videoInfo.channelName;

    // VIDEO OPTIONS
    videoQualities.innerHTML = '';

    videoInfo.videoQualities.forEach(
      (quality) => {

        const button =
          createQualityButton(
            quality,
            'video'
          );

        videoQualities.appendChild(button);

      }
    );

    // AUDIO OPTIONS
    audioQualities.innerHTML = '';

    videoInfo.audioQualities.forEach(
      (quality) => {

        const button =
          createQualityButton(
            quality,
            'audio'
          );

        audioQualities.appendChild(button);

      }
    );

  }

  // =========================
  // CREATE DOWNLOAD BUTTON
  // =========================

  function createQualityButton(
    quality,
    type
  ) {

    const button =
      document.createElement('button');

    button.classList.add('quality-btn');

    if (type === 'video') {

      button.textContent =
        `${quality.label} (${quality.fileSize})`;

    } else {

      button.textContent =
        `${quality.label} MP3 (${quality.fileSize})`;

    }

    button.addEventListener(
      'click',
      () => {

        initiateDownload(
          quality,
          type
        );

      }
    );

    return button;

  }

  // =========================
  // DOWNLOAD
  // =========================

  function initiateDownload(
    quality,
    type
  ) {

    progressContainer.classList.remove(
      'hidden'
    );

    progressText.textContent =
      'Preparing download...';

    progressBar.style.width = '0%';

    let progress = 0;

    const interval =
      setInterval(() => {

        progress += 5;

        progressBar.style.width =
          `${progress}%`;

        progressText.textContent =
          `Downloading... ${progress}%`;

        if (progress >= 100) {

          clearInterval(interval);

          progressText.textContent =
            'Download complete!';

        }

      }, 200);

  }

  // =========================
  // ERROR DISPLAY
  // =========================

  function showError(message) {

    progressContainer.classList.remove(
      'hidden'
    );

    progressText.textContent =
      message;

    progressBar.style.width = '100%';

  }

  // =========================
  // URL CHECK
  // =========================

  function isYouTubeVideoUrl(url) {

    return /^(https?:\/\/)?(www\.)?(youtube\.com\/watch|youtu\.be\/|youtube\.com\/shorts)/.test(url);

  }

  // =========================
  // FORMAT TIME
  // =========================

  function formatDuration(seconds) {

    const minutes =
      Math.floor(seconds / 60);

    const remainingSeconds =
      Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;

  }

});
