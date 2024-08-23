// ==UserScript==
// @name	youtubeSubscriptionManagerOpmlExporter
// @version	3
// @match	http://*.youtube.com/feed/channels
// @match	https://*.youtube.com/feed/channels
// @grant	none
// ==/UserScript==

(new MutationObserver(check)).observe(document, {childList: true, subtree: true});

function check(changes, observer) {
  let requiredNode = document.querySelector("#dismissible .grid-subheader.style-scope.ytd-shelf-renderer");
  if (!requiredNode) return;

  requiredNode = document.querySelector("#dismissible #contents");
  if (!requiredNode) return;

  // both nodes exist at this point, can disconnect and execute own logic
  observer.disconnect();
  addDownloadButtons();
}

async function extractChannels() {
  var channels = [];
  let channelsToFetch = [];

  let items = document.querySelectorAll("a#main-link");
  for (item of items) {
    let name = item.querySelector("yt-formatted-string.ytd-channel-name").textContent;
    if (item.href.includes("@")) {
      channelsToFetch.push(item.href);
    } else if (item.href.includes(".com/user/")) {
      var idRegEx = /.com\/user\/(.*)$/g;
      let uid = idRegEx.exec(item.href)[1];

      channels.push({
        "uid":   uid,
        "name": name
      });
    } else {
      var idRegEx = /.com\/channel\/(.*)$/g;
      let cid = idRegEx.exec(item.href)[1];

      channels.push({
        "cid":   cid,
        "name": name
      });
    }
  }

  let promises = [];
  for (channelToFetch of channelsToFetch) {
    const promise = fetch(channelToFetch)
      .then(resp => resp.text())
      .then(body => {
        let rssRegEx = /href=".*?com\/feeds\/videos\.xml\?channel_id=(.*?)"/g;
        let regExResult = rssRegEx.exec(body);
        let cid = regExResult == null ? null : regExResult[1];

        if (cid == null) {
          let orgUrlRegEx = /og:url.*?com\/channel\/(.*?)"/g;
          regExResult = orgUrlRegEx.exec(body);
          cid = regExResult == null ? null : regExResult[1];
        }

        if (cid) {
          channels.push({
            "cid":   cid,
            "name": name
          });
        }
      });
    promises.push(promise);
  }

  if (promises.length > 0) {
    await Promise.all(promises);
  }

  return channels;
}

function buildOpmlFile(channels) {
  var opmlFile = `<opml version="1.1">
\t<body>
\t\t<outline text="YouTube Subscriptions" title="YouTube Subscriptions">`;
  for (item of channels) {
    let n = item.name.replaceAll("#", "%23").replaceAll("&", "&amp;");
    if (item.cid) {
	    opmlFile += `\n\t\t\t<outline text="${n}" title="${n}" type="rss" xmlUrl="https://www.youtube.com/feeds/videos.xml?channel_id=${item.cid}" />`;
    } else {
	    opmlFile += `\n\t\t\t<outline text="${n}" title="${n}" type="rss" xmlUrl="https://www.youtube.com/feeds/videos.xml?user=${item.uid}" />`;
    }
  }
  opmlFile += `
\t\t</outline>
\t</body>
</opml>`;

  return opmlFile;
}

function download(opmlFile) {
  var a = document.createElement("a");
  a.href = "data:text;charset=utf-8," + opmlFile;
  a.download = "subscription_manager";
  a.click();
}

function addDownloadButtons() {
  let node = document.querySelector("#dismissible .grid-subheader.style-scope.ytd-shelf-renderer");
  if (node) node.appendChild(createDownloadButton());
  node = document.querySelector("#dismissible #contents");
  if (node) node.appendChild(createDownloadButton());
}

function createDownloadButton() {
  let buttonDiv = document.createElement("div");
  buttonDiv.style.marginLeft = "50%";

  let button = document.createElement("button");
  button.type = "button";
  button.innerText = "export opml";
  button.onclick = async () => {
    button.disabled = true;
    let oldText = button.innerText;
    button.innerText = 'please wait...'
    download(encodeURIComponent(buildOpmlFile(await extractChannels())));
    button.innerText = oldText;
    button.disabled = false;
  }
  buttonDiv.appendChild(button);

  return buttonDiv;
}
