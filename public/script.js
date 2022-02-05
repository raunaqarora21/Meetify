const myVideo = document.createElement('video');
const videoGrid = document.getElementById('video-grid');
const socket = io('/');
const shareScreenButton = document.getElementById("share-screen");


var myPeer = new Peer()
var Peer_ID;

var myVideoStream;
var myVideoTrack;
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
    const video = document.createElement("video");
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
    // console.log("called");
    // console.log(videoGrid);
    // main wrapper
    const videoWrapper = document.createElement("div");
    videoWrapper.id = "video-wrapper";
    videoWrapper.classList.add("video-wrapper");

    // const namePara = document.createElement("p");
    // namePara.innerHTML = user.name;
    // namePara.classList.add("video-element");
    // namePara.classList.add("name");

    // const elementsWrapper = document.createElement("div");
    // elementsWrapper.classList.add("elements-wrapper");
    // elementsWrapper.appendChild(namePara);


    video.srcObject = stream;
    video.setAttribute("peer", peerId);
    // video.setAttribute("name", user.name);

    if (peerId == null) {
        video.classList.add("mirror");
        // localAudioFXElement = audioFX;
    }

    video.addEventListener('loadedmetadata', () => {
        video.play();
    });

  

    // videoWrapper.appendChild(elementsWrapper);
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
meetingToggleBtn.addEventListener("click", (e) => {
    const currentElement = e.target;
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
});


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
    if(shareScreenButton.classList.contains("active")) {
        
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
            var videoTrack = stream.getVideoTracks()[0];
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
// console.log("Input" + text);

// $('html').keydown((e) => {
//     console.log("Called" + text.val().length);

//     if (e.which == 13 && text.val().length !== 0) {
//         console.log(text.val());
//         socket.emit('message', text.val());
//         text.val('');
//     }
   

// });

// socket.on('createMessage',message =>{
//     console.log("Server",message);
//     $('ul').append(`<li class="message"><b>user</b><br/>${message}</li>`);
//     $('ul').scrollTop($('ul').prop('scrollHeight'));
// })


const addMessage = (sender, userName, message) => {
    const messageBoxButton = document.getElementById("message-box");
    // const chatPanel = document.getElementById("chat-panel");
    // if (
    //     !chatPanel.classList.contains("display-chat-panel") &&
    //     !messageBoxButton.classList.contains("dot")
    // )
        // messageBoxButton.classList.add("dot");
    const time = new Date();
    const chatBox = document.querySelector(".chat-box");
    const chat = document.createElement("div");
    chat.classList.add("chat");
    chat.classList.add(sender);
    chat.innerHTML = `<p class="name">${userName} <span class="time"> ${time.toLocaleString(
        "en-US",
        { hour: "numeric", minute: "numeric", hour12: true }
    )} </span> </p><p class="message">${message}</p>`;
    $('ul').append(chat);
    $('ul').scrollTop($('ul').prop('scrollHeight'));

};
const chatForm = document.querySelector(".chat-input-wrapper");
chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const chatInput = document.getElementById("chat-input");
    if (chatInput.value == "") return;
    socket.emit("client-send", chatInput.value);
    addMessage("me", name, chatInput.value);
    // scrollDown(".chat-box");
    chatInput.value = "";
});
//Scroll Down in Chatbox
socket.on("client-podcast", (data, userName) => {
    console.log(userName + ": " + data);
    addMessage("user", userName, data);
    // scrollDown(".chat-box");
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



//Screen Recording 

const screenRecordingButton = document.getElementById("screen-record");

const recordingToogle = () => {
    if(screenRecordingButton.classList.contains("active")) {
        screenRecordingButton.classList.remove("active");
        screenRecordingButton.innerHTML = '<i class="fas fa-record-vinyl"></i> <span>Start Recording</span>';
        stopRecording();
    } else {
        screenRecordingButton.classList.add("active");
        screenRecordingButton.innerHTML = "Stop Recording";
        startRecording();
    }
}

var data = [];
var mediaRecorder;
const startRecording = () => {
    console.log("start recording");
    // var options =  { mimeType: "video/webm;" };
    mediaRecorder = new MediaRecorder(myVideoStream, {
        mineType: "video/webm;codecs=H264",
    });
    mediaRecorder.start(1000);
    mediaRecorder.ondataavailable = (e) => {
        

            data.push(e.data);
            // console.log(e.data);

        
        
    }

    mediaRecorder.onstop = (e) => {
        console.log("recording stopped");
        console.log(data);
        data = [];
        delete mediaRecorder;
    }
}


const stopRecording = () => {
    console.log("stop recording");
    const blob = new Blob(data, { type: data[0].type });
    mediaRecorder.stop();

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'test.webm';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
    , 100);

    data = [];


   
}




const showChat = (e) => {
    // console.log("chat");
    const messageContainter = document.getElementById("chat_window");
    
    if(messageContainter.style.display == "none"){
        messageContainter.style.display = "flex";
    } else {
        messageContainter.style.display = "none";
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







   
              
         

