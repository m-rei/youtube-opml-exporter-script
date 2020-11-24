// ==UserScript==
// @name     youtubeSubscriptionManagerOpmlExporter
// @version  1
// @match		 http://*.youtube.com/feed/channels
// @match		 https://*.youtube.com/feed/channels
// @grant    none
// ==/UserScript==

download(buildOpmlFile(extractChannels()));

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
    if (item.cid) {
	    opmlFile += `\n\t\t\t<outline text="${item.name}" title="${item.name}" type="rss" xmlUrl="https://www.youtube.com/feeds/videos.xml?channel_id=${item.cid}" />`;
    } else {
	    opmlFile += `\n\t\t\t<outline text="${item.name}" title="${item.name}" type="rss" xmlUrl="https://www.youtube.com/feeds/videos.xml?user=${item.uid}" />`;
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
  a.href = "data:text," + escape(opmlFile);
  a.download = "subscription_manager";
  a.click();
}
