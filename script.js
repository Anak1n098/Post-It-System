//Identifies when the button is clicked, thus follows with the function
document.getElementById("createPostIt").addEventListener("click", () => {
    
    //This will create a new Post-It note when the button is clicked
    const postIt = document.createElement("div");
    postIt.className = "postIt"; //Assign a CSS class for styling
    postIt.innerHTML = `
        <input type="color" class="colorPicker" value="#ffeb4b" title="Change color">
        <textarea placeholder="Type here..."></textarea>
            <button class="downloadBut">⬇️ PNG</button>
            <button class="deleteBut">🗑️</button>
        
    `;
    

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
}
