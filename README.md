# WebRTC Chatroom

To learn more about WebRTC and React, I created a WebRTC chatroom using purely the WebRTC API, without socket.io.\

When opening the app you can choose between two options: Hosting a chatroom and joining one.
When hosting a room, send the generated offer to your joining friend who can enter the offer in his browser.
When the joiner receives the generated answer to the offer, send it to the host and connect!\

You can now chat and send files over the WebRTC protocol!\
Note that sending files currently only works on Firefox browser.\
If joining from different networks does not work, the problem is that the stun servers used are not working.
If this is the case, the app will work on the same LAN in different browser windows.
