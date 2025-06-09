//Identifies when the button is clicked, thus follows with the function
document.getElementById("createPostIt").addEventListener("click", () => {
    
    //This will create a new Post-It note when the button is clicked
    const postIt = document.createElement("div");
    postIt.className = "postIt"; //Assign a CSS class for styling
    postIt.innerHTML = `
        <input type="color" class="colorPicker" value="#ffeb4b" title="Change color">
        <textarea placeholder="Type here..."></textarea>
            <button class="downloadBut">⬇️ PNG</button>
            <button class="twitterBut">🐦 Share</button>
            <button class="deleteBut">🗑️</button>
            <button class="saveBut">💾 Save</button>
        <div class="time-controls">
            <input type="time" class="timeInput">
            <button class="alarmBut">⏰ Set Alarm</button>
            <button class="cancelAlarmBut" style="display:none;">❌ Cancel</button>
        </div>
        
    `;
    
    postIt.addEventListener('mouseup', () => {
        localStorage.setItem('postIts', JSON.stringify([
            ...getAllPostItData(), 
            { width: postIt.offsetWidth, height: postIt.offsetHeight }
        ]));
    });


    //This adds the post it into the contianer, so they become visible and stay organized
    document.getElementById("PostContainer").appendChild(postIt);

    postIt.querySelector(".colorPicker").addEventListener("input", (e) => {
        postIt.style.backgroundColor = e.target.value;
    });

    //A delete button for each post it
    postIt.querySelector(".deleteBut").addEventListener("click", () => {
        postIt.remove(); //Remove the Post-It when clicked
    });

    //Download button to save the Post-It as a PNG
    postIt.querySelector(".downloadBut").addEventListener("click", () => {
        downloadAsPNG(postIt);
    });

    postIt.querySelector(".twitterBut").addEventListener("click", (e) => {
        e.preventDefault(); // Prevent default behavior
        shareToTwitter(postIt);
    });

    postIt.querySelector(".saveBut").addEventListener("click", () => {
        exportAsPostItFile(postIt);
    });
});

//Dark mode toggle assossiated with the button
const darkModeButton = document.getElementById("darkModeBut");

darkModeButton.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    
    //Updates the button text based on the current mode
    const isDarkMode = document.body.classList.contains("dark-mode");
    darkModeButton.textContent = isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
});

//Saving setting to local storage
localStorage.setItem("darkMode", isDarkMode);

//Checks setting on page load
if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");

    //this makes the button change to light mode
    darkModeButton.textContent = "☀️ Light Mode";
}

//Function so that the button actually works
function downloadAsPNG(element) {
    html2canvas(element).then(canvas => {
        const link = document.createElement("a");
        link.download = "post-it.png"; // File name
        link.href = canvas.toDataURL("image/png");
        link.click();
    });

    const alarmBut = postIt.querySelector(".alarmBut");
    const timeInput = postIt.querySelector(".timeInput");

    alarmBut.addEventListener("click", () => {
        setAlarm(postIt, timeInput.value);
    });

}

function setAlarm(postIt, alarmTime) {
        if (!alarmTime) {
            alert("Please select a time first!");
            return;
        }
    
        const now = new Date();
        const [hours, minutes] = alarmTime.split(":");
        const alarmDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            parseInt(hours),
            parseInt(minutes)
        );
    
        const timeoutId = setTimeout(() => {
            //Add flashing class
            postIt.classList.add('alarm-trigger');
            
            //Show notification
            if (Notification.permission === 'granted') {
                new Notification('Post-It Alarm', {
                    body: postIt.querySelector('textarea').value
                });
            } else {
                alert(`ALARM: "${postIt.querySelector('textarea').value}"`);
            }
            
            //Stop flashing after 10 seconds
            setTimeout(() => {
                postIt.classList.remove('alarm-trigger');
            }, 10000);
        }, timeRemaining);
    
        //Store the timeout ID in the post-it element
        postIt.dataset.timeoutId = timeoutId;
        
        // pdate button text
        const alarmBut = postIt.querySelector('.alarmBut');
        alarmBut.textContent = `⏰ Alarm Set (${alarmTime})`;
        alarmBut.dataset.alarmTime = alarmTime;
    }

//Request notification permission when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (window.Notification) {
        Notification.requestPermission();
    }
});

const cancelAlarmBut = postIt.querySelector('.cancelAlarmBut');

cancelAlarmBut.addEventListener('click', () => {
    clearTimeout(parseInt(postIt.dataset.timeoutId));
    postIt.classList.remove('alarm-trigger');
    cancelAlarmBut.style.display = 'none';
    alarmBut.style.display = 'inline-block';
    alarmBut.textContent = '⏰ Set Alarm';
});

// Background image handling
const bgUpload = document.getElementById("bgUpload");
const bgUploadButton = document.getElementById("bgUploadButton");
const resetBgButton = document.getElementById("resetBgButton");

// Trigger file input when button is clicked
bgUploadButton.addEventListener("click", () => {
    bgUpload.click();
});

// Handle image selection
bgUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            document.body.style.backgroundImage = `url(${event.target.result})`;
            document.body.style.backgroundSize = "cover";
            document.body.style.backgroundAttachment = "fixed";
            localStorage.setItem("bgImage", event.target.result); // Save to localStorage
        };
        reader.readAsDataURL(file);
    }
});

// Reset background
resetBgButton.addEventListener("click", () => {
    document.body.style.backgroundImage = "";
    localStorage.removeItem("bgImage");
});

// Load saved background on page load
window.addEventListener("load", () => {
    const savedBg = localStorage.getItem("bgImage");
    if (savedBg) {
        document.body.style.backgroundImage = `url(${savedBg})`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundAttachment = "fixed";
    }
});

document.getElementById("bgOpacity").addEventListener("input", (e) => {
    document.body.style.backgroundColor = `rgba(0, 0, 0, ${1 - e.target.value})`;
});

//Twitter share function
function shareToTwitter(postIt) {
    //Makes the post it into an image
    html2canvas(postIt).then(canvas => {
        canvas.toBlob(blob => {
            //Creates a temporary link to download the image
            const url = URL.createObjectURL(blob);
            const text = postIt.querySelector("textarea").value || "Check out my Post-It note!";
            
            //Open Twitter Web Intent with prefilled text + image
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
            window.open(twitterUrl, "_blank");
        }, 'image/png');
    });
}

//Attach to Twitter button
document.querySelector(".twitterBut").addEventListener("click", () => {
    shareToTwitter(postIt);
});

function exportAsPostItFile(postIt) {
    const postItData = {
        text: postIt.querySelector("textarea").value,
        color: postIt.style.backgroundColor || "#ffeb3b",
        timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(postItData)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `postit_${Date.now()}.postit`; // e.g., postit_1712345678901.postit
    a.click();
}

document.getElementById("importBtn").addEventListener("click", () => {
    document.getElementById("importFile").click();
});

document.getElementById("importFile").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const { text, color } = JSON.parse(event.target.result);
            createPostIt(text, color); // Recreate the Post-It
        } catch {
            alert("Invalid Post-It file!");
        }
    };
    reader.readAsText(file);
});