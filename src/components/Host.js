import { useEffect, useState } from "react";
import SentMessage from "./SentMessage";
import ReceivedMessage from "./ReceivedMessage";
import NotificationMessage from "./NotificationMessage";
import FileMessage from "./FileMessage";
import Typebox from "./Typebox";
import Topbar from "./Topbar";

export default function Host() {
    const [messages, addMessage] = useState([]);
    const [hostConnection] = useState(new RTCPeerConnection());
    const [sendChan, updateSendChan] = useState(null);

    // Scrolls down the message div automatically each render.
    useEffect(() => {
        let messageDiv = document.getElementById("message-div");
        messageDiv.scrollTop = messageDiv.scrollHeight;
    })

    // Connects peers with the answer.
    function connect() {
        let answerInput = document.getElementById("answer-input");
        if (answerInput.value) {
            try {
                let answer = new RTCSessionDescription(JSON.parse(answerInput.value));
                hostConnection.setRemoteDescription(answer);
            } catch {
                answerInput.style.border="1px solid red";
                answerInput.value = "";
                answerInput.placeholder = "Incorrect answer SDP";
            }
        } else {
            answerInput.style.border="1px solid red";
        }
    };

    function createOffer() {
        let offerSDP = document.getElementById("offer-sdp");

        // Creates the offer.
        hostConnection.createOffer().then((offer) => hostConnection.setLocalDescription(offer));
        hostConnection.onicecandidate = (message) => {
            if (message.candidate) {
                offerSDP.innerHTML = JSON.stringify(hostConnection.localDescription);
            }
        };

        let channel = hostConnection.createDataChannel("SendChannel");

        // On channel open handler.
        channel.onopen = (m) => {
            addMessageNotification("connected! You can now chat.");
            document.getElementById("disconnect-btn").classList.remove("hidden");
            document.getElementById("download-btn").classList.remove("hidden");
        };
        // On channel close handler.
        channel.onclose = (m) => {
            addMessageNotification("Disconnected.");
            document.getElementById("send-btn").disabled = true;
        };
        // Onmessage handler.
        channel.onmessage = (m) => {
            if (m.data instanceof Blob) {
                let mess = {id: Math.random(),
                    type: "file",
                    time: new Date().toLocaleTimeString(),
                    file: m.data};
                addMessage((oldMessages) =>[...oldMessages, mess]);
            } else {
                addMessageReceived(m.data);
            }
        };

        updateSendChan(channel);
    };

    // Sends a message through the channel.
    function sendMessage() {
        let sendMessageBox = document.getElementById("sendMessageBox");
        if (sendMessageBox.value) {
            sendChan.send(sendMessageBox.value);
            addMessageSent(sendMessageBox.value);
            sendMessageBox.value = "";
        }
    };

    // Disconnects from the channel.
    function disconnect() {
        hostConnection.close();
    };

    // Downloads all messages in a .txt file.
    function downloadLog() {
        let text = "";
        let messageLog = [...messages];
        messageLog.map(el => {
            text = text.concat("{Type: " + el.type);
            text = text.concat("; Time: " + el.time);
            text = text.concat("; Content: " + el.content + "}\n");
            return null;
        });

        const blob = new Blob([text], { type: 'text/plain' });
        let href = URL.createObjectURL(blob);

        const downloadLink = Object.assign(document.createElement("a"), {
            href,
            style:"display:none",
            download:"webRTC-ChatLog.txt"});
        document.body.appendChild(downloadLink);
        downloadLink.click();
        URL.revokeObjectURL(href);
        downloadLink.remove();
    };

    // function blurScreen() {
    //     document.getElementById("video-call-div").classList.remove("hidden");
    //         document.getElementById("connect-div").classList.add("pointer-events-none");
    //         document.getElementById("connect-div").classList.add("blur-sm");
    //         document.getElementById("message-div").classList.add("pointer-events-none");
    //         document.getElementById("message-div").classList.add("blur-sm");
    //         document.getElementById("typebox").classList.add("pointer-events-none");
    //         document.getElementById("typebox").classList.add("blur-sm");
    // }

    // function unBlurScreen() {
    //     document.getElementById("video-call-div").classList.add("hidden");
    //         document.getElementById("connect-div").classList.remove("pointer-events-none");
    //         document.getElementById("connect-div").classList.remove("blur-sm");
    //         document.getElementById("message-div").classList.remove("pointer-events-none");
    //         document.getElementById("message-div").classList.remove("blur-sm");
    //         document.getElementById("typebox").classList.remove("pointer-events-none");
    //         document.getElementById("typebox").classList.remove("blur-sm");
    // }

    // // Starts a video call.
    // function videoCall() {
    //     let videoScreen = document.getElementById("videoTestSelf");
    //     navigator.mediaDevices.getUserMedia({audio: true, video: true}).then((stream) => {
    //         const videoTracks = stream.getVideoTracks();
    //         stream.onremovetrack = () => {
    //             addMessageNotification("Video chat ended.");
    //         };
    //         videoScreen.srcObject = stream;
    //         videoScreen.onloadedmetadata = () => {
    //             videoScreen.play();
    //         };

    //         // Ontrack handler.
    //         hostConnection.ontrack = (message) => {
    //             console.log("New track")
    //         };

    //         for (const t of videoTracks) {
    //             hostConnection.addTrack(t);
    //             console.log("added track: ");
    //             console.log(t);
    //         }

    //         // Blurs the background,
    //         blurScreen();
    //     }).catch((error) => {
    //         addMessageNotification("Error starting video chat.");
    //     });
    // }

    // function endVideoCall() {
    //     let videoEl = document.getElementById("videoTestSelf");
    //     let stream = videoEl.srcObject;
    //     const tracks = stream.getTracks();
    //     tracks.forEach((track) => {
    //         track.stop();
    //     });

    //     videoEl.srcObject = null;
    //     unBlurScreen();
    // }

    function addMessageNotification(text) {
        let mess = {id: Math.random(),
            type: "notification",
            time: new Date().toLocaleTimeString(),
            content: text};
        addMessage((oldMessages) =>[...oldMessages, mess]);
    }

    function addMessageSent(text) {
        let mess = {id: Math.random(),
            type: "sent",
            time: new Date().toLocaleTimeString(),
            content: text};
        addMessage((oldMessages) =>[...oldMessages, mess]);
    }

    function addMessageReceived(text) {
        let mess = {id: Math.random(),
            type: "received",
            time: new Date().toLocaleTimeString(),
            content: text};
        addMessage((oldMessages) =>[...oldMessages, mess]);
    }

    function sendFile() {
        const uploadFile = Object.assign(document.createElement("input"), {
            type: "file",
            style:"display:none"
        });
        uploadFile.addEventListener("change", (e) => {
            let file = e.target.files[0];
            if (file) {
                sendChan.send(file.name);
                sendChan.send(file);
                addMessageSent("You sent a file.");
            }
        })
        uploadFile.click();
    }

    function toggleConnectDiv() {
        document.getElementById("connect-div").classList.toggle("hidden");
    }

    return (
        <>
            <div className="px-5 md:px-44 bg-gray-700 h-screen flex flex-col justify-between">
                <Topbar />
                <p className="text-xl mb-2 text-center hover:cursor-pointer" onClick={toggleConnectDiv}>To host a session, follow these two steps!</p>
                <div id="connect-div" className="p-5 text-white text-center">
                    <span>1: Send the following offer SDP to your friend.<button className="bg-slate-100 text-black rounded-xl text-sm p-1 ml-2 mb-2" id="get-offer-btn" onClick={createOffer}>Get offer</button></span>

                    <textarea disabled id='offer-sdp' className="w-full mb-6 h-10 bg-slate-100 text-black p-2 resize-none"></textarea>
                    <p>4: Paste answer SDP here.<button className="bg-slate-100 text-black rounded-xl p-1 text-sm ml-2 mb-2" id="connect-btn" onClick={connect}>Connect</button></p>

                    <textarea id="answer-input" className="bg-slate-100 h-10 w-full mb-3 text-black p-2 resize-none"></textarea>
                    <button className="bg-slate-100 text-black rounded-xl p-1 text-sm mb-2 mr-1 hidden" id="disconnect-btn" onClick={disconnect}>Disconnect</button>
                    <button className="bg-slate-100 text-black rounded-xl p-1 text-sm mb-2 ml-1 hidden" id="download-btn" onClick={downloadLog}>Download log</button>
                    {/* <button className="bg-slate-100 text-black rounded-xl p-1 text-sm mb-2 ml-1" id="video-call-btn" onClick={videoCall}>Video call</button> */}
                    <hr></hr>
                </div>

                <div id="message-div" className="overscroll-contain h-80 grow overflow-y-auto flex flex-col">
                    {messages.map((el) => {
                        if (el.type === "sent") {
                            return <SentMessage text={el.content} time={el.time} key={el.id} />
                        } else if (el.type === "received") {
                            return <ReceivedMessage text={el.content} time={el.time} key={el.id} />
                        } else if (el.type === "file") {
                            return <FileMessage blob={el.file} time={el.time} fileNameExt={messages.at(-2).content} key={el.id} />
                        } else {
                            return <NotificationMessage text={el.content} key={el.id} />
                        }
                    })}
                </div>
                <Typebox sendMessage={sendMessage} sendFile={sendFile} />

                {/* <div id="video-call-div" className="hidden">
                    <video id="videoTestOther" className="absolute w-96 h-96 left-32 top-16"></video>
                    <video id="videoTestSelf" className="absolute w-96 h-96 right-32 top-16"></video>
                    <button className="absolute rounded-2xl p-2 font-bold bg-red-600 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" onClick={endVideoCall}>Stop video call</button>
                </div> */}
            </div>

        </>
    )
}
