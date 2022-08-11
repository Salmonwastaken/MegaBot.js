/**
 * Mascot Bot
*/

const {globalInterval,
  dropboxRefresh,
  dropboxClientId,
  dropboxClientSecret,
  mascotchannelId,
  dropboxFolder,
  danId} = require(`/etc/Projects/MegaBot/vars.json`);

const Dropbox = require(`dropbox`); // eslint-disable-line no-unused-vars

const dropboxConfig = {
  refreshToken: dropboxRefresh,
  clientId: dropboxClientId,
  clientSecret: dropboxClientSecret,
};

const dbx = new Dropbox(dropboxConfig);

/**
* Fetches neccesary Discord objects
* @param {Object} client The Discord client object
* @return {Object} Two Discord objects we want to use send messages.
*/
async function fetchDiscordObjects(client) {
  const mascotChannel = await client.channels.fetch(mascotchannelId).catch();
  const user = await client.users.fetch(danId).catch();
  return {mascotChannel, user};
}

/**
* Queries Dropbox API for currently available files
* @param {Object} user A variable that holds the Discord object
* @param {String} mascotChannel The channel to send the mascot to
* @return {Object} fileName and filePath from first of available files.
*/
async function getFile(user, mascotChannel) {
  dbx.filesListFolder({path: dropboxFolder}).then((fileList) => {
    const fileName = fileList.result.entries[0].name;
    const filePath = fileList.result.entries[0].path_lower;
    return {fileName, filePath};
  }).catch((err) => {
    console.error(err);
    // Just a bit of fun if Dropbox doesn't return anything.
    mascotChannel.send({
      content: `${user} Man what the fuck there are no images left.`,
    });
  });
}

/**
* Queries Dropbox API for a download link based on filepath
* @param {String} filePath The Dropbox filepath
* @return {String} Returns a temporary link to download said file
*/
async function getFileLink(filePath) {
  const fileObject = dbx.filesGetTemporaryLink({path: filePath});
  const fileLink = fileObject.result.link;
  return fileLink;
}

/**
* Sends a Discord message to mascotChannel with an an attachment.
* @param {String} fileLink The Dropbox filepath for the attachment
* @param {String} fileName The Dropbox filename for the attachment
* @param {String} mascotChannel The channel to send the mascot to
*/
async function sendMascot(fileLink, fileName, mascotChannel) {
  mascotChannel.send({
    files: [{
      attachment: fileLink,
      name: fileName,
    }],
  }).catch((err) => {
    console.error(err);
  });
}

/**
* Queries the Dropbox API to delete the file we posted
* @param {Object} filePath The Dropbox filepath
*/
async function deleteFile(filePath) {
  dbx.filesDeleteV2({path: filePath}).then((response) => {
    console.log('Succesfully deleted file: ' +
    response.result.metadata.path_display);
  }).catch((err) => {
    console.error(err);
  });
}

module.exports = {
  masBot: async function(client) {
    setInterval(async () => {
      const {mascotChannel, user} = fetchDiscordObjects(client);
      const {fileName, filePath} = getFile(user, mascotChannel);
      const fileLink = getFileLink(filePath);
      sendMascot(fileLink, fileName, mascotChannel);
      deleteFile(filePath);
    }, globalInterval);
  },
};
