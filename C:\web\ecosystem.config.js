
module.exports = {
  apps: [{
    name: 'qiazhiyisuan',
    script: 'npm',
    args: 'run start -- -p 3001',
    // The following line is crucial to fix the "Unexpected token ':'" error
    // by telling Node.js to use its modern module loader.
    node_args: '--experimental-modules',
    // Ensures the app restarts on crash
    autorestart: true,
    watch: false,
    // Helps with graceful shutdowns
    exec_mode: 'fork',
  }]
};
