// ==UserScript==
// @name	youtubeSubscriptionManagerOpmlExporter
// @version	2
// @match	http://*.youtube.com/feed/channels
// @match	https://*.youtube.com/feed/channels
// @grant	none
// ==/UserScript==

addDownloadButtons();

function extractChannels() {
  var channels = []

  let items = document.querySelectorAll("a#main-link");
  for (item of items) {
    let name = item.querySelector("yt-formatted-string.ytd-channel-name").textContent;
    if (item.href.includes(".com/user/")) {
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
  let node1 = document.querySelector("#dismissible .grid-subheader.style-scope.ytd-shelf-renderer");
  let node2 = document.querySelector("#dismissible #contents");
  if (!node1 && !node2) return;
  if (node1) node1.appendChild(createDownloadButton());
  if (node2) node2.appendChild(createDownloadButton());
  
}

function createDownloadButton() {
    let buttonDiv = document.createElement("div");
  buttonDiv.style.marginLeft = "50%";

  let button = document.createElement("button");
  button.type = "button";
  button.innerText = "export opml";
  button.onclick = () => {
    download(encodeURIComponent(buildOpmlFile(extractChannels())));
  }
  buttonDiv.appendChild(button);
  return buttonDiv;
}
