const fs = require('fs');
const path = require('path');
const prompt = require('prompt');
const login = require('facebook-chat-api');
const chalk = require('chalk');

prompt.start();

prompt.get(['appstatePath', 'targetID', 'timer', 'folderPath'], function (err, result) {
  if (err) { return onErr(err); }

  const appState = JSON.parse(fs.readFileSync(result.appstatePath, 'utf8'));

  // Function to get all image files in the folder
  function getImagesFromFolder(folderPath) {
    return fs.readdirSync(folderPath).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext); // Filter only image files
    });
  }

  login({ appState }, (err, api) => {
    if (err) return console.error(err);

    const images = getImagesFromFolder(result.folderPath);
    if (images.length === 0) {
      return console.error("No images found in the folder");
    }

    let imageIndex = 0;

    setInterval(() => {
      const imagePath = path.join(result.folderPath, images[imageIndex]);

      // Send image
      api.sendMessage({ attachment: fs.createReadStream(imagePath) }, result.targetID, () => {
        const now = new Date();
        const formattedTime = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
        console.log(chalk.bold.hex('#00FF00')(`--> Your Convo/Inbox Link  :-- ${result.targetID}`));
        console.log(chalk.bold.hex('#00FF00')(`--> Image Sent: ${imagePath} || Date & Time ::- ${formattedTime}`));

        // Increment image index, reset to 0 if at the end of the list
        imageIndex = (imageIndex + 1) % images.length;
      });

    }, `${result.timer}000`);
  });
});

function onErr(err) {
  console.log(err);
  return 1;
}
