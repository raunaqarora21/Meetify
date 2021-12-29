const myVideo = document.createElement('video');
const videoGrid = document.getElementById('video-grid');
const socket = io('/');


var myPeer = new Peer()


var myVideoStream;
var myVideoTrack;
const peers = {};
myVideo.muted = true;


navigator.mediaDevices.getUserMedia({
    video: true,
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
    
    }).catch(
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
    
    
      
    }));
});
    








function connectToNewUser(userId, stream) {
    // set others peerid and send my stream
    const call = myPeer.call(userId, stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
      
                addVideoStream(
                    video,
                    userVideoStream,
                    call.peer,
                    data.user,
                    data.admin
                );
            
    });
    call.on("close", () => {
        video.parentElement.remove();
    });
    peers[userId] = call;
}


const addVideoStream = (video, stream, peerId, user) => {
    console.log("called");
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
            
                
                    console.log("myPerr called");
                    addVideoStream(
                        video,
                        userVideoStream,
                        call.peer,
                        // data.user
                        null
                    );
                
        });
        call.on("close", () => {
            video.parentElement.remove();
        });
    });

    socket.on("user-connected", (userId, fname, audio, video, count) => {
        socket.emit("user-callback");
        connectToNewUser(userId, myVideoStream);
        // changeCount(count);
    });
}
myPeer.on("open", (id) => {
    Peer_ID = id;
    console.log("peer id is : ", id);
    socket.emit('join-room', ROOM_ID, id)

});

let text = $('input');


$('html').keydown((e) => {
    if (e.which == 13 && text.val().length !== 0) {
        // console.log(text.val());
        socket.emit('message', text.val());
        text.val('');
    }
   

});

socket.on('createMessage',message =>{
    console.log("Server",message);
    $('ul').append(`<li class="message"><b>user</b><br/>${message}</li>`);
    $('ul').scrollTop($('ul').prop('scrollHeight'));
})

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
    console.log("button called");
    console.log(enabled);
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







   
              
         

