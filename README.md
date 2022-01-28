# youtube-opml-exporter-script
Greasemonkey firefox addon script restoring RSS exporter functionality for youtube, which has been recently removed

Youtube has recently removed the subscription_manager page
> https://www.youtube.com/subscription_manager

it now redirects to
> https://www.youtube.com/feed/channels

where there is no button to export your subscription list as an OMPL file, i.e.
> https://www.youtube.com/subscription_manager?action_takeout=1

Just install Greasemonkey in Firefox, create a new script and copy & paste the code found here.

It will add two download buttons (top & bottom) to the page with which you can do an opml export!

This script could potentially be used by Chrome via its Tampermonkey addon, but I have not tested it.
