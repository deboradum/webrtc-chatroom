import { useEffect } from "react";

export default function Host() {
    let hostConnection
    let sendChan
    let answerInput
    let offerSDP
    useEffect(() => {
        // Sets up the client connection. This connection sends out the connection
        // request.
        hostConnection = new RTCPeerConnection();
        answerInput = document.getElementById("answer-input");
        offerSDP = document.getElementById("offer-sdp");

        hostConnection.oniceconnectionstatechange = function (e) {
            var state = hostConnection.iceConnectionState
            console.log("Change: " + hostConnection.iceConnectionState)
        };

        hostConnection.onicecandidate = (message) => {
            if (message.candidate) {
                offerSDP.innerHTML = JSON.stringify(hostConnection.localDescription)
                navigator.clipboard.writeText(JSON.stringify(hostConnection.localDescription))
            }
        };
    })

    function connect() {
        if (answerInput.value) {
            let answer = new RTCSessionDescription(JSON.parse(answerInput.value));
            hostConnection.setRemoteDescription(answer)
        }
    };

    function createOffer() {
        // Creates a channel.
        sendChan = hostConnection.createDataChannel("SendChannel");
        // Creates the offer.
        hostConnection.createOffer().then((offer) => hostConnection.setLocalDescription(offer))

        sendChan.onopen = (message) => {
            console.log("Connection opened from LC side.");
        }
        sendChan.onmessage = (m) => {
            // messagesBox.innerHTML += "remote: " + m.data
        }
    };

    return (
        <>
            <div id="connect-div" className="bg-gray-700 h-screen p-5 text-white">
                <p className="text-xl my-8">To host a session, follow these two steps!</p>
                <p>1: Send the following offer to your friend:</p>
                <button className="bg-white text-black rounded p-1 ml-5" id="get-offer-btn" onClick={createOffer}>Get offer</button>
                <br></br>
                <textarea id='offer-sdp' className="w-4/5 my-6 text-black p-2"></textarea>
                <p>3: Paste answer here:</p>
                <button className="bg-white text-black rounded p-1 ml-5" id="connect-btn" onClick={connect}>Connect</button>
                <br></br>
                <textarea id="answer-input" className="w-4/5 my-6 text-black p-2"></textarea>
                <hr></hr>
            </div>
            <div id="message-div">

            </div>
        </>
    )
}