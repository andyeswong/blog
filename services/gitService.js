const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

const STORAGE_DIR = path.join(__dirname, '..', 'storage', 'posts');
const REPO_URL = 'https://github.com/andyeswong/blog_posts.git';
const GIT_TIMEOUT = 30000; // 30 seconds

/**
 * Initializes the posts repository (git clone if not exists)
 * @returns {Promise<boolean>} true if initialized, false if failed
 */
async function initializeRepository() {
  try {
    // Check if git is initialized
    const storageParent = path.join(STORAGE_DIR, '..');
    
    try {
      execSync('git status', { 
        cwd: storageParent,
        stdio: 'pipe',
        timeout: GIT_TIMEOUT 
      });
      console.log('✓ Posts repository already initialized');
      return true;
    } catch (error) {
      // Not a git repo, initialize it
      if (!REPO_URL) {
        console.warn('⚠ POSTS_REPO_URL not set. Git repository not initialized.');
        return false;
      }

      console.log('Initializing posts repository...');
      execSync(`git clone ${REPO_URL} .`, {
        cwd: storageParent,
        stdio: 'pipe',
        timeout: GIT_TIMEOUT
      });
      console.log('✓ Posts repository initialized successfully');
      return true;
    }
  } catch (error) {
    console.error('✗ Failed to initialize repository:', error.message);
    return false;
  }
}

/**
 * Pulls latest posts from GitHub
 * @returns {Promise<Object>} Object with status and details
 */
async function pullLatestPosts() {
  try {
    const storageParent = path.join(STORAGE_DIR, '..');

    // First, ensure repo is initialized
    const isInitialized = await initializeRepository();
    if (!isInitialized) {
      return {
        success: false,
        message: 'Repository not initialized. Set POSTS_REPO_URL environment variable.',
        timestamp: new Date().toISOString()
      };
    }

    // Pull latest changes
    console.log('Pulling latest posts from GitHub...');
    const output = execSync('git pull origin master', {
      cwd: storageParent,
      stdio: 'pipe',
      timeout: GIT_TIMEOUT,
      encoding: 'utf-8'
    });

    console.log('✓ Posts updated successfully');
    return {
      success: true,
      message: 'Posts synced with GitHub',
      output: output.trim(),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    // Check if it's just "Already up to date"
    if (error.message.includes('Already up to date')) {
      console.log('ℹ Posts already up to date');
      return {
        success: true,
        message: 'Posts already up to date',
        timestamp: new Date().toISOString()
      };
    }

    console.error('✗ Failed to pull posts:', error.message);
    return {
      success: false,
      message: 'Failed to sync posts from GitHub',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Gets the last pull timestamp from a cache file
 * @returns {Promise<Date|null>}
 */
async function getLastPullTime() {
  try {
    const cacheFile = path.join(__dirname, '..', '.git-pull-cache');
    const data = await fs.readFile(cacheFile, 'utf-8');
    return new Date(data);
  } catch (error) {
    return null;
  }
}

/**
 * Sets the last pull timestamp in cache file
 * @returns {Promise<void>}
 */
async function setLastPullTime() {
  try {
    const cacheFile = path.join(__dirname, '..', '.git-pull-cache');
    await fs.writeFile(cacheFile, new Date().toISOString());
  } catch (error) {
    console.error('Failed to update pull cache:', error.message);
  }
}

/**
 * Checks if pull is needed (throttle to prevent excessive pulls)
 * @param {number} minIntervalMs - Minimum interval between pulls (default 5 minutes)
 * @returns {Promise<boolean>}
 */
async function shouldPull(minIntervalMs = 5 * 60 * 1000) {
  try {
    const lastPull = await getLastPullTime();
    if (!lastPull) return true;

    const timeSinceLastPull = Date.now() - lastPull.getTime();
    return timeSinceLastPull > minIntervalMs;
  } catch (error) {
    return true;
  }
}

/**
 * Smart pull with throttling
 * @param {Object} options - Pull options
 * @returns {Promise<Object>}
 */
async function smartPull(options = {}) {
  const {
    force = false,
    minInterval = 5 * 60 * 1000 // 5 minutes default
  } = options;

  if (!force && !(await shouldPull(minInterval))) {
    console.log('ℹ Skipping pull (throttled)');
    return {
      success: true,
      message: 'Skipped (throttled)',
      throttled: true,
      timestamp: new Date().toISOString()
    };
  }

  const result = await pullLatestPosts();
  if (result.success) {
    await setLastPullTime();
  }
  return result;
}

module.exports = {
  initializeRepository,
  pullLatestPosts,
  smartPull,
  shouldPull,
  getLastPullTime,
  setLastPullTime
};
