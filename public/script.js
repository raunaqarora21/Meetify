const myVideo = document.createElement('video');
const videoGrid = document.getElementById('video-grid');
const socket = io('/');
const shareScreenButton = document.getElementById("share-screen");
var audio = new Audio('chat_sound.mp3');

var myPeer = new Peer()
var Peer_ID;
let video;
var myVideoStream;
var myVideoTrack;
var videoTrack;
const peers = {};
// myVideo.muted = true;


navigator.mediaDevices.getUserMedia({
    // video: true,
    audio: true
}).then((stream) => {
    navigator.mediaDevices.getUserMedia(
        {
            video: true,
            audio: true

        }
    ).then((stream) => {
        myVideoStream = stream;
        myVideoTrack = stream.getVideoTracks()[0];
        // console.log(myVideoTrack);
        // addVideoStream(myVideo, stream);
        processStream(myVideoStream);


    // peer.on('call', call => {
    //     call.answer(stream);
    //     const video = document.createElement('video');
    //     call.on('stream', userVideoStream => {
    //         addVideoStream(video, userVideoStream);
    //     })
    // })
    //
    
    }).catch((err) =>{
        navigator.mediaDevices.getUserMedia(
            {
                video: true,
                audio: false
    
            }
        ).then((stream) => {
            myVideoStream = stream;
            // myVideoTrack = stream.getVideoTracks()[0];
            // addVideoStream(myVideo, stream);
            // processStream(myVideoStream);
    
    
      
        });
    
});
});

//disconneting the user
socket.on("user-disconnected", (userId, count) => {
    if (peers[userId]) {
        peers[userId].close();
        delete peers[userId];
        changeCount(count);
    }
});

    

function connectToNewUser(userId, stream) {
    // set others peerid and send my stream
    const call = myPeer.call(userId, stream);
    video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        fetch(`/user?peer=${call.peer}&room=${ROOM_ID}`)
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            addVideoStream(
                video,
                userVideoStream,
                call.peer,
                data.user,
                data.admin
            );
        });
            
    });
    call.on("close", () => {
        video.parentElement.remove();
    });
    peers[userId] = call;
}


const addVideoStream = (video, stream, peerId, user) => {
    const micBtn = document.createElement("button");
    micBtn.classList.add("video-element");
    micBtn.classList.add("mic-button");
    micBtn.innerHTML = `<ion-icon name="mic-off-outline"></ion-icon>`;
    micBtn.classList.add("mic-off");

    // create audio FX
    // const audioFX = new SE(stream);
    // const audioFXElement = audioFX.createElement();
    // audioFXElement.classList.add("mic-button");

    // if (user.audio) micBtn.classList.add("off");
    // else audioFXElement.classList.add("off");

    // video off element
    const videoOffIndicator = document.createElement("div");
    videoOffIndicator.classList.add("video-off-indicator");
    videoOffIndicator.innerHTML = `<ion-icon name="videocam-outline"></ion-icon>`;

    // create pin button
    const pinBtn = document.createElement("button");
    pinBtn.classList.add("video-element");
    pinBtn.classList.add("pin-button");
    pinBtn.innerHTML = `<ion-icon name="expand-outline"></ion-icon>`;
    // main wrapper
    const videoWrapper = document.createElement("div");
    videoWrapper.id = "video-wrapper";
    videoWrapper.classList.add("video-wrapper");

    const namePara = document.createElement("p");
    namePara.innerHTML = user.name;
    namePara.classList.add("video-element");
    namePara.classList.add("name");

    const elementsWrapper = document.createElement("div");
    elementsWrapper.classList.add("elements-wrapper");
    elementsWrapper.appendChild(namePara);
    elementsWrapper.appendChild(pinBtn);
    elementsWrapper.appendChild(micBtn);
    // elementsWrapper.appendChild(audioFXElement);
    elementsWrapper.appendChild(videoOffIndicator);


    video.srcObject = stream;
    video.setAttribute("peer", peerId);
    // video.setAttribute("name", user.name);

    if (peerId == null) {
        // video.classList.add("mirror");
        // localAudioFXElement = audioFX;
    }

    video.addEventListener('loadedmetadata', () => {
        video.play();
    });

  

    // videoWrapper.appendChild(elementsWrapper);
    // videoWrapper.appendChild(namePara);
    videoWrapper.appendChild(video);

     videoGrid.append(videoWrapper);
     const observer = new MutationObserver((mutationsList, observer) => {
        const removeNodeLength = mutationsList[0].removedNodes.length;
        const targetNode = mutationsList[0].target;
        if (removeNodeLength > 0) {
            targetNode.remove();
            observer.disconnect();
        }
    });
    observer.observe(videoWrapper, {
        childList: true,
    });
    // console.log(videoGrid);

}

const meetingToggleBtn = document.getElementById("meeting-toggle");

const meetingToggle = () => {
    const currentElement = meetingToggleBtn;
    const counter = document.getElementById("user-number");
    // const count = Number(counter.innerText) + 1;
    if (currentElement.classList.contains("call-button")) {
        // changeCount(count);
        currentElement.classList.remove("call-button");
        currentElement.classList.add("call-end-button");
        currentElement.classList.add("tooltip-danger");
        currentElement.innerHTML = '<i class="fas fa-phone-slash"></i> <span>End Call</span>';
        currentElement.setAttribute("tool_tip", "Leave the Meeting");
        socket.emit(
            "join-room",
            ROOM_ID,
            Peer_ID,
            USER_ID,
            name,
            myVideoStream.getAudioTracks()[0].enabled,
            myVideoStream.getVideoTracks()[0].enabled
        );
    } 
    else location.replace(`/`);

}


function processStream(stream) {
    addVideoStream(myVideo, myVideoStream, null, {
        name: name,
        audio: myVideoStream.getAudioTracks()[0].enabled,
        video: myVideoStream.getVideoTracks()[0].enabled,
    });
    // recieve the other user's stream
    myPeer.on("call", (call) => {
        peers[call.peer] = call;
        call.answer(myVideoStream);
        const video = document.createElement("video");
        call.on("stream", (userVideoStream) => {
            
            fetch(`/user?peer=${call.peer}&room=${ROOM_ID}`)
            .then((res) => {
                // console.log(res);
                return res.json();
            })
            .then((data) => {
                addVideoStream(
                    video,
                    userVideoStream,
                    call.peer,
                    data.user
                );
            }).catch((err) => {
                console.log(err);
            }
            );

                
        });
        call.on("close", () => {
            video.parentElement.remove();
        });
    });

    socket.on("user-connected", (userId, fname, audio, video, count) => {
        socket.emit("user-callback");
        connectToNewUser(userId, myVideoStream);
        changeCount(count);
    });
}
myPeer.on("open", (id) => {
    Peer_ID = id;
    console.log("peer id is : ", id);
    // socket.emit('join-room', 
    //     ROOM_ID,
    //     Peer_ID,
    //     USER_ID,
    //     name,
    //     myVideoStream.getAudioTracks()[0].enabled,
    //     myVideoStream.getVideoTracks()[0].enabled
    
    // )

});

//share screeen feature
const shareScreen = () => {
    
    
    
    // if(e.target.classList.contains("active")) return;
    // video.classList.add("mirror");
    if(shareScreenButton.classList.contains("active")) {
        shareScreenButton.classList.remove("active");
        console.log("share screen off" + videoTrack);
        videoTrack.stop();
        stopPresenting(videoTrack);
       
        return;
    }
    shareScreenButton.innerText = "Stop Sharing Screen";

    
    shareScreenButton.classList.add("active");
    navigator.mediaDevices
        .getDisplayMedia({
            video: true,
            audio: {

                echoCancellation: true,
                noiseSuppression: true,
                sampleRate : 44100,
            },
        }).then((stream) => {
            videoTrack = stream.getVideoTracks()[0];
            console.log("video track is : ", videoTrack);
            myVideoTrack = myVideoStream.getVideoTracks()[0];
            
            
            replaceVideoTrack(myVideoStream, videoTrack);
            for (peer in peers) {
                let sender = peers[peer].peerConnection
                    .getSenders()
                    .find(function (s) {
                        return s.track.kind == videoTrack.kind;
                    });
                sender.replaceTrack(videoTrack);
            }
            
            videoTrack.onended = function () {
                shareScreenButton.classList.remove("active");

                stopPresenting(videoTrack);
            }

        }).catch((err) => {
            console.log(err);
        }
        );
    };


const stopPresenting = (videoTrack) => {
    console.log("stopping presenting");
    // videoTrack.stop();
    // shareScreenButton.classList.remove("active");
    shareScreenButton.innerHTML = '<i class="fas fa-play"></i> <span>Share Screen</span>';
    for (peer in peers) {
        let sender = peers[peer].peerConnection.getSenders().find(function (s) {
            return s.track.kind == videoTrack.kind;
        });
        sender.replaceTrack(myVideoTrack);
    }
    replaceVideoTrack(myVideoStream, myVideoTrack);
};

const replaceVideoTrack = (stream, videoTrack) => {
    stream.removeTrack(stream.getVideoTracks()[0]);
    stream.addTrack(videoTrack);
};
let text = $('input');




const addMessage = (sender, userName, message) => {
    const messageBoxButton = document.getElementById("message-box");
    
    const time = new Date();
    const chatBox = document.querySelector(".chat-box");
    const chat = document.createElement("div");
    chat.classList.add("chat");
    chat.classList.add(sender);
    chat.innerHTML = `<p class="name">${userName} <span class="time"> ${time.toLocaleString(
        "en-US",
        { hour: "numeric", minute: "numeric", hour12: true }
    )} </span> </p><p class="message">${message}</p>`;
    // console.log(chat);
    if(sender != "me") 
    {
        audio.play();
    }
    chatBox.append(chat);
    // chatBox.scrollTop(chatBox.prop('scrollHeight'));

};

const scrollDown = (query) => {
    var objDiv = document.querySelector(query);
    objDiv.scrollTop = objDiv.scrollHeight;
};
const chatForm = document.querySelector(".chat-input-wrapper");
chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const chatInput = document.getElementById("chat-input");
    if (chatInput.value == "") return;
    socket.emit("client-send", chatInput.value);
    addMessage("me", name, chatInput.value);
    scrollDown(".chat-box");
    chatInput.value = "";
});
//Scroll Down in Chatbox
socket.on("client-podcast", (data, userName) => {
    console.log(userName + ": " + data);
    addMessage("user", userName, data);
    scrollDown(".chat-box");
});




//Mute our audio
const muteUnmute = () => {
    // console.log(myVideoStream.getAudioTracks())
    
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        myVideoStream.getAudioTracks()[0].enabled = true;
        setMuteButton();
    }
}


const setUnmuteButton = () => {
    const html = `
        <i class="unmute fas fa-microphone-slash"></i>
        <span>Unmute</span>
    `;

    document.querySelector(".main__mute_button").innerHTML = html;
    
}

const setMuteButton = () => {
    const html = `
        <i class="mute fas fa-microphone"></i>
        <span>Mute</span>
    `;

    document.querySelector(".main__mute_button").innerHTML = html;
}

//stop and start video
const stopStart = () => {
    const enabled = myVideoTrack.enabled;
    // console.log("button called");
    // console.log(enabled);
    if (enabled) {
        myVideoTrack.enabled = false;
        setStartButton();

    } else {
        myVideoTrack.enabled = true;
        setStopButton();

    }
}

const setStopButton = () => {
    const html = `
        <i class="fas fa-video"></i>
        <span>Stop Video</span>
    `;

    document.querySelector(".main__video_button").innerHTML = html;
}

const setStartButton = () => {
    const html = `
        <i class="stop fas fa-video-slash"></i>
        <span>Start Video</span>
    `;

    document.querySelector(".main__video_button").innerHTML = html;
}

//updating participants number
const changeCount = (count) => {
    const counter = document.getElementById("user-number");
    // counter.innerHTML = count;
};

var stream; //Recorded Stream
var shouldStop;
//Screen Recording 

const screenRecordingButton = document.getElementById("screen-record");

const recordingToogle = async() => {
    if(screenRecordingButton.classList.contains("active")) {
        screenRecordingButton.classList.remove("active");
        screenRecordingButton.innerHTML = '<i class="fas fa-record-vinyl"></i> <span>Start Recording</span>';
        shouldStop = true;
        // stopRecording();
    } else {
        screenRecordingButton.classList.add("active");
        screenRecordingButton.innerHTML = "Stop Recording";
        // stream = await recordScreen();
        await recordScreen();
        // startRecording(stream);
    }
}
async function recordScreen() {
    const mimeType = 'video/webm';
    shouldStop = false;
    const constraints = {
      video: true
    };
    const displayStream = await navigator.mediaDevices.getDisplayMedia({video: true, audio: true});
    // voiceStream for recording voice with screen recording
    const voiceStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    let tracks = [...displayStream.getTracks(), ...voiceStream.getAudioTracks()]
    const stream = new MediaStream(tracks);
    handleRecord({stream, mimeType})
  }
// async function recordScreen() {
//     return await navigator.mediaDevices.getDisplayMedia({
//         audio: true, 
//         video: { mediaSource: "screen"}
//     });
// }
async function recordAudio() {
    const mimeType = 'audio/webm';
    shouldStop = false;
    const stream = await navigator.mediaDevices.getUserMedia({audio: true});
    handleRecord({stream, mimeType})
}
async function recordVideo() {
    const mimeType = 'video/webm';
    shouldStop = false;
    const constraints = {
      audio: true,
      video: true,
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    handleRecord({stream, mimeType})
}
var data = [];
var mediaRecorder;
const startRecording = (stream) => {
    console.log("start recording");
    // var options =  { mimeType: "video/webm;" };
    mediaRecorder = new MediaRecorder(stream, {
        mineType: "video/webm;codecs=H264",
    });
    mediaRecorder.start(1000);
    mediaRecorder.ondataavailable = (e) => {
        

            data.push(e.data);
            // console.log(e.data);

        
        
    }

    mediaRecorder.onstop = (e) => {
        console.log("recording stopped");
        // console.log(data);
        data = [];
        delete mediaRecorder;
    }
}
const handleRecord = function ({stream, mimeType}) {
    // to collect stream chunks
    let recordedChunks = [];
    stopped = false;
    const mediaRecorder = new MediaRecorder(stream);
  
    mediaRecorder.ondataavailable = function (e) {
      if (e.data.size > 0) {
        recordedChunks.push(e.data);
      }
      // shouldStop => forceStop by user
      if (shouldStop === true && stopped === false) {
        mediaRecorder.stop();
        stopped = true;
      }
    };
    mediaRecorder.onstop = function () {
      const blob = new Blob(recordedChunks, {
        type: mimeType
      });
      recordedChunks = []
      const filename = window.prompt('Enter file name'); // input filename from user for download
      const downloadLink = document.createElement('a');
      const url = URL.createObjectURL(blob);
      downloadLink.href = URL.createObjectURL(blob); // create download link for the file
      downloadLink.download = `${filename}.webm`; // naming the file with user provided name
      document.body.appendChild(downloadLink);
      downloadLink.click();
      setTimeout(() => {
          document.body.removeChild(downloadLink);
        //   window.URL.revokeObjectURL(url);
      }
      , 100);
      let tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      delete mediaRecorder;
    //   stopRecord();
    };
  
    mediaRecorder.start(200); // here 200ms is interval of chunk collection
  };

const stopRecording = () => {
    console.log("stop recording");
    const blob = new Blob(data, { type: data[0].type });
    mediaRecorder.stop();
    // stream.stop();
    // if(stream)
    // {
    //     let tracks = stream.getTracks();

    //     tracks.forEach(track => track.stop());
    // }
    // console.log(stream);

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'recording.webm';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
    , 100);

    data = [];


   
}

const chatCloseButton = document.getElementById('chat-close-button')
chatCloseButton.addEventListener('click', e => {
    messageContainter.style.display = "none";
})  
const messageContainter = document.getElementById("chat_window");


const showChat = (e) => {
    console.log("Clicked chat");
    
    if(messageContainter.style.display == "flex"){
        messageContainter.style.display = "none";
    } else {
        messageContainter.style.display = "flex";
    }

    // document.body.classList.toggle("showChat");
}


// const showInvite = () => {
//     // console.log("invite");
//     document.body.classList.add("showInvite");
//     document.getElementById("roomLink").value = window.location.href;
// }

// const hideInvitePopUp = () => {
//     document.body.classList.remove("showInvite");
// }



const copyToClip = () => {
    // var inviteLink = window.location.href + "?room=" + ROOM_ID;
    document.getElementById("roomLink").value = window.location.href;
    var inviteLinkInput = document.getElementById("roomLink");

    // inviteLinkInput.value = inviteLink;
    inviteLinkInput.select();
    // document.execCommand("copy");
    navigator.clipboard.writeText(inviteLinkInput.value);
    console.log(inviteLinkInput.value);
    alert("Invite link copied to clipboard");
    // hideInvitePopUp();
}







   
              
         

