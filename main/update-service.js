const semver = require('semver');
const { RELEASES_API_URL } = require('./config');

function createUpdateState(overrides = {}) {
  const status = overrides.status || 'idle';

  return {
    status,
    version: overrides.version ?? null,
    releaseUrl: overrides.releaseUrl ?? null,
    message: overrides.message || '',
    canCheck: overrides.canCheck ?? status !== 'checking',
    canOpen: overrides.canOpen ?? Boolean(overrides.releaseUrl)
  };
}

function createUpdateService({ app, shell }) {
  let updateState = createUpdateState({
    status: 'idle',
    message: 'Check for updates when you are ready.'
  });

  function setUpdateState(overrides = {}) {
    updateState = createUpdateState({
      ...updateState,
      ...overrides
    });

    return updateState;
  }

  async function fetchLatestRelease() {
    const response = await fetch(RELEASES_API_URL, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'oh-my-clipboard'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub release lookup failed (${response.status})`);
    }

    return response.json();
  }

  async function checkForUpdates() {
    setUpdateState({
      status: 'checking',
      message: 'Checking GitHub Releases...',
      releaseUrl: null,
      version: null,
      canOpen: false
    });

    try {
      const latest = await fetchLatestRelease();
      const currentVersion = semver.coerce(app.getVersion());
      const latestVersion = semver.coerce(String(latest.tag_name || '').replace(/^v/, ''));

      if (!latestVersion) {
        return setUpdateState({
          status: 'error',
          message: 'Could not read the latest release version.',
          canOpen: false
        });
      }

      const isNewer = currentVersion ? semver.gt(latestVersion, currentVersion) : true;

      if (!isNewer) {
        return setUpdateState({
          status: 'not-available',
          version: app.getVersion(),
          message: 'You are already on the latest version.',
          releaseUrl: latest.html_url || null,
          canOpen: false
        });
      }

      return setUpdateState({
        status: 'available',
        version: latest.tag_name?.replace(/^v/, '') || latestVersion.version,
        releaseUrl: latest.html_url || `https://github.com/jgmh99/OH-MY-CLIPBOARD/releases/tag/${latest.tag_name}`,
        message: 'A newer version is available on GitHub Releases.',
        canOpen: true
      });
    } catch (error) {
      return setUpdateState({
        status: 'error',
        message: error?.message || 'Update check failed.',
        canOpen: false
      });
    }
  }

  function openUpdateRelease() {
    if (!updateState?.releaseUrl) {
      return updateState;
    }

    shell.openExternal(updateState.releaseUrl);
    return updateState;
  }

  return {
    checkForUpdates,
    getState: () => updateState,
    openUpdateRelease
  };
}

module.exports = {
  createUpdateService,
  createUpdateState
};
