"use strict";
const https = require('https');
const fs = require('fs');
const crypto =  require("crypto");
const mime = require('mime-types'); //used to detect file's mime type

function conversationToArray(conversation) {
	// Split the conversation by line breaks to separate each dialogue
	const dialogues = conversation.split(/\n/);

	// Filter out any empty lines that may result from the split
	const filteredDialogues = dialogues.filter(dialogue => dialogue.trim() !== '');

	// Remove the "user:" and "chatgpt:" prefixes and trim any leading/trailing whitespace
	const formattedDialogues = filteredDialogues.map(dialogue =>
	  dialogue.replace(/^(user|chatgpt):\s*/i, '').trim()
	);

	return formattedDialogues;
}

async function saveFile(url) {
	return new Promise((resolve, reject) => {
	  strapi.log.info(`Saving the picture ${url}`);
	  const fileName = crypto.randomUUID();
	  const rootDir = process.cwd();
	  const filePath = `${rootDir}/public/uploads/${fileName}.png`;
	  const file = fs.createWriteStream(filePath);
	  const request = https.get(url, function(response) {
		response.pipe(file);

		file.on("finish", async () => {
		  file.close();
		  strapi.log.info("Download Completed");

		  // Ensure the file is closed before accessing its stats
		  fs.stat(filePath, async (err, stats) => {
			if (err) {
			  reject(strapi.log.error('Error getting file stats'));
			}

			// Now that the download is complete and file is closed, upload it
			const upload = await strapi.plugins.upload.services.upload.upload({
			  data: {}, // mandatory declare the data (can be empty)
			  files: {
				path: filePath,
				name: `${fileName}.png`,
				type: mime.lookup(filePath), // mime type of the file
				size: stats.size,
			  },
			});
			strapi.log.info('Upload Completed');
			resolve(upload[0].formats['medium'].url)
		  });
		});
	  });

	  request.on('error', (e) => {
		reject(strapi.log.error(`Request error: ${e.message}`));
	  });
	})
  }

module.exports = {
	conversationToArray,
	saveFile
};
