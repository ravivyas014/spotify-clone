console.log('lets write javascript');
let currentSong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
    // Check for invalid values (NaN, undefined, null)
    if (isNaN(seconds) || seconds === null || seconds === undefined) {
        return "00:00"; // Default value
    }

    // Ensure the input is an integer
    seconds = Math.floor(seconds);

    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    if (songs.length === 0) {
       
        return;
    }

   
    playMusic(songs[0], true); // Play first song (paused)

    
 // Show all the songs in the playlist
 let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
 songUL.innerHTML = ""
 for (const song of songs) {
     let decodedSong = decodeURIComponent(song);
     songUL.innerHTML = songUL.innerHTML + `<li> <img class="invert"  src="img/music.svg" alt="">
                         <div class="info">
                             <div>${decodedSong}</div>
                             
                         </div>
                         <div class="playnow">
                             <span>Play Now</span>
                         <img class="invert" src="img/play.svg" alt="">
                         </div> </li>`;

 }

 //attach an event listner to each song
 Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
     e.addEventListener("click", element => {
         console.log(e.querySelector(".info").firstElementChild.innerHTML);
         playMusic(e.querySelector(".info").firstElementChild.innerHTML)
     })

 })
   return songs
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

    
}

async function displayAlbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 
        if(e.href.includes("/songs") && !e.href.includes(".htaccess")){
            let folder = e.href.split("/").slice(-2)[0]
            //get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
                                <circle cx="24" cy="24" r="22" fill="#1ED760" />
                                <path d="M16 12L36 24L16 36Z" fill="black" />
                            </svg>

                        </div>
                        <img src="/songs/${folder}/coverimg.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                        
                    </div>`
        }
    }
     // load the playlist whenever card is ckicked
     Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{        
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
        
    })
}

async function main() {


    // get the list of all the songs
    await getSongs("songs/ncs")
    playMusic(songs[0], true)

   //display all the albums on the page
    displayAlbums()

    //attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })
    // add an event listener to seekbar 
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100

    })
    // add event listener to hammburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    // add event listener to close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })
    // add an event listener to previous
    previous.addEventListener("click", () => {
        console.log("previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index - 1) >= 0) {
            playMusic(songs[index-1])
        }

    })
    // add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })
    // add an event listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
        console.log("Setting volume to", e.target.value, "/ 100");
        currentSong.volume = parseInt(e.target.value)/100
        if (currentSong.volume > 0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg","volume.svg")     
        }
    })
    // add an event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", (e)=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })
   
}
main()


