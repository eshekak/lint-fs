function getBinary () {
  try {
    const getBinary = require('./getBinary');

    return getBinary();
  } catch {}
}

const binary = getBinary();

if (binary && binary.uninstall) {
  binary.uninstall();
}
