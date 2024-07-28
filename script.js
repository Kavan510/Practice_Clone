let currentsong = new Audio();
function formatTime(seconds) {
  // Round the seconds to remove any fractional part
  seconds = Math.floor(seconds);

  // Calculate minutes and remaining seconds
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = seconds % 60;

  // Pad remaining seconds with leading zero if needed
  let formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${minutes}:${formattedSeconds}`;
}

// Example usage:
let timeInSeconds = 72;
let formattedTime = formatTime(timeInSeconds);
console.log(formattedTime); // Output: "01:12"

async function getSongs() {
  let a = await fetch("http://127.0.0.1:5500/songs/");
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;

  let as = div.getElementsByTagName("a");
  let songs = [];

  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".m4a")) {
      songs.push(element.href);
    }
  }
  return songs;
}

function cleanSongName(songName) {
  // songName=songName.split("/songs/");

  songName = songName.replaceAll("%20", " ");
  songName = songName.replace(/%5B.*?%5D/g, "");
  songName = songName.replace(".m4a", "");
  songName = songName.trim();
  return songName;
}

function display(songName) {
  // Decode URL-encoded characters
  songName = decodeURIComponent(songName);

  // Remove the leading number and dash if present
  songName = songName.replace(/^\d+\s*-\s*/, "");

  // Remove the trailing artist name after the core song name
  songName = songName.replace(/Official Video.*/, "").trim();

  return songName;
}
const playMusic = (track, pause = false) => {
  currentsong.src = track;
  if (!pause) {
    currentsong.play();
    play.src = "pause.svg";
  }
  const cleanedSongName = display(track.split("/songs/")[1]); // Pass only the file name part to display function
  document.querySelector(".songinfo").innerHTML = cleanedSongName;
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function main() {
  let songs = await getSongs();
  console.log(songs);
  playMusic(songs[0], true);

  let songUL = document.querySelector(".songList ul");
  if (!songUL) {
    console.error("No .songList ul element found in the document.");
    return;
  }

  let songListHTML = "";
  for (const song of songs) {
    let rawSongName = song.split("/songs/")[1];
    let cleanedSongName = cleanSongName(rawSongName);
    songListHTML += `
      <li>
        <img class="invert" src="music.svg" alt="" />
        <div class="info">
          <div>${cleanedSongName}</div>
          <div>Ram</div>
        </div>
        <div class="playnow">
          <span>Play now</span>
          <img src="play.svg" alt="" class="invert" />
        </div></li>`;
  }
  songUL.innerHTML = songListHTML;

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e, index) => {
    e.addEventListener("click", () => {
      console.log(songs[index]);
      playMusic(songs[index]);
    });
  });

  play.addEventListener("click", () => {
    if (currentsong.paused) {
      play.src = "pause.svg";
      currentsong.play();
    } else {
      play.src = "play.svg";
      currentsong.pause();
    }
  });
  currentsong.addEventListener("timeupdate", () => {
    console.log(currentsong.currenttime, currentsong.currentduration);
    document.querySelector(".songtime").innerHTML = `${formatTime(
      currentsong.currentTime
    )}:${formatTime(currentsong.duration)}`;

    let seekbar = document.querySelector(".circle");
    let percentage = (currentsong.currentTime / currentsong.duration) * 100;
    seekbar.style.left = percentage + "%";
  });

  document.querySelector(".seekbar").addEventListener("click",e=>{
     let seekbar = document.querySelector(".seekbar");
     let rect = seekbar.getBoundingClientRect();
     let offsetX = e.clientX - rect.left; 
     let percentage = (offsetX / rect.width) * 100;
     document.querySelector(".circle").style.left = percentage + "%";

     currentsong.currentTime = (offsetX / rect.width) * currentsong.duration;
    
  });
}

main();
