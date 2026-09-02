/* =========================================================
   STUDYSMART JAVASCRIPT
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const sidebar = document.getElementById("sidebar");
const mobileMenu = document.getElementById("mobileMenu");

const themeToggle = document.getElementById("themeToggle");

const addClassButton = document.getElementById("addClass");

const subjectInput = document.getElementById("subject");
const dayInput = document.getElementById("day");
const timeInput = document.getElementById("time");
const roomInput = document.getElementById("room");

const toast = document.getElementById("toast");

const navItems = document.querySelectorAll(".nav-item");


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

mobileMenu.addEventListener("click", () => {

    sidebar.classList.toggle("open");

});


/* =========================================================
   NAVIGATION
========================================================= */

navItems.forEach(item => {

    item.addEventListener("click", () => {

        navItems.forEach(nav => {
            nav.classList.remove("active");
        });

        item.classList.add("active");

        const page = item.dataset.page;

        showToast(
            `${capitalize(page)} section selected`
        );

        if (window.innerWidth <= 900) {
            sidebar.classList.remove("open");
        }

    });

});


function capitalize(text) {

    return text.charAt(0).toUpperCase() + text.slice(1);

}


/* =========================================================
   DARK MODE
========================================================= */

const savedTheme = localStorage.getItem("studysmart-theme");

if (savedTheme === "dark") {

    document.body.classList.add("dark");

    themeToggle.innerHTML =
        '<i class="fa-regular fa-moon"></i>';

}


themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    const darkMode =
        document.body.classList.contains("dark");

    localStorage.setItem(
        "studysmart-theme",
        darkMode ? "dark" : "light"
    );


    if (darkMode) {

        themeToggle.innerHTML =
            '<i class="fa-regular fa-moon"></i>';

    } else {

        themeToggle.innerHTML =
            '<i class="fa-regular fa-sun"></i>';

    }

});


/* =========================================================
   ADD CLASS
========================================================= */

addClassButton.addEventListener("click", () => {

    const subject = subjectInput.value;
    const day = dayInput.value;
    const time = timeInput.value.trim();
    const room = roomInput.value.trim();


    /* Validation */

    if (!subject) {

        showToast("Please select a subject.");

        subjectInput.focus();

        return;
    }


    if (!day) {

        showToast("Please select a day.");

        dayInput.focus();

        return;
    }


    if (!time) {

        showToast("Please enter a time.");

        timeInput.focus();

        return;
    }


    /* Find the appropriate day */

    const dayIndex = {

        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6

    };


    const columnIndex = dayIndex[day];


    /*
       Try to find a timetable row whose time
       matches the entered time.
    */

    const rows =
        document.querySelectorAll("#timetable tbody tr[data-time]");


    let targetRow = null;


    rows.forEach(row => {

        if (
            row.dataset.time.toLowerCase()
                .replace("–", "-")
                .replace(/\s/g, "")
            ===
            time.toLowerCase()
                .replace("-", "-")
                .replace(/\s/g, "")
        ) {

            targetRow = row;

        }

    });


    /*
       If an exact time isn't found,
       use the first available row.
    */

    if (!targetRow) {

        targetRow = rows[0];

    }


    const targetCell =
        targetRow.children[columnIndex];


    if (!targetCell) {

        showToast("Unable to add this class.");

        return;

    }


    /* Pick a color */

    const colors = [
        "green",
        "orange",
        "blue",
        "purple",
        "pink",
        "teal"
    ];

    const randomColor =
        colors[Math.floor(Math.random() * colors.length)];


    /* Create class */

    const classBox =
        document.createElement("div");

    classBox.className =
        `class-box ${randomColor}`;

    classBox.innerHTML = `

        <b>${escapeHTML(subject)}</b>

        <small>
            ${escapeHTML(room || "No room")}
        </small>

    `;


    /*
       Replace current class.
       You could instead append it if you want
       multiple classes in the same cell.
    */

    targetCell.innerHTML = "";

    targetCell.appendChild(classBox);


    /* Save */

    saveTimetable();


    /* Clear form */

    subjectInput.value = "";
    dayInput.value = "";
    timeInput.value = "";
    roomInput.value = "";


    showToast(
        `${subject} added to ${day}!`
    );

});


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;

}


/* =========================================================
   SAVE TIMETABLE
========================================================= */

function saveTimetable() {

    const timetable =
        document.getElementById("timetable");

    localStorage.setItem(
        "studysmart-timetable",
        timetable.innerHTML
    );

}


/* =========================================================
   LOAD TIMETABLE
========================================================= */

function loadTimetable() {

    const saved =
        localStorage.getItem(
            "studysmart-timetable"
        );

    if (!saved) return;


    const timetable =
        document.getElementById("timetable");

    const tbody =
        timetable.querySelector("tbody");


    /*
       Only restore the tbody content.
    */

    const parser =
        new DOMParser();

    const doc =
        parser.parseFromString(
            `<table>${saved}</table>`,
            "text/html"
        );

    const savedTbody =
        doc.querySelector("tbody");


    if (savedTbody) {

        tbody.innerHTML =
            savedTbody.innerHTML;

    }

}


/* =========================================================
   DELETE / CLEAR CLASS
========================================================= */

document
    .getElementById("timetable")
    .addEventListener("dblclick", event => {

        const classBox =
            event.target.closest(".class-box");

        if (!classBox) return;


        const confirmed =
            confirm(
                "Remove this class from the timetable?"
            );


        if (!confirmed) return;


        classBox.remove();

        saveTimetable();

        showToast("Class removed.");

    });


/* =========================================================
   TOAST
========================================================= */

let toastTimer;


function showToast(message) {

    const toastText =
        toast.querySelector("span");

    toastText.textContent = message;

    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 2500);

}


/* =========================================================
   WEEKLY BUTTON
========================================================= */

document
    .getElementById("weeklyButton")
    .addEventListener("click", () => {

        showToast(
            "You're already viewing the weekly timetable."
        );

    });


/* =========================================================
   FULL DAY BUTTON
========================================================= */

document
    .querySelector(".full-day")
    .addEventListener("click", () => {

        showToast(
            "Full day schedule opened."
        );

    });


/* =========================================================
   REMINDER CHECKBOXES
========================================================= */

document
    .querySelectorAll(".reminder button")
    .forEach(button => {

        button.addEventListener("click", () => {

            const reminder =
                button.closest(".reminder");


            reminder.style.opacity = "0.45";

            button.innerHTML = "✓";

            showToast(
                "Reminder marked as complete."
            );

        });

    });


/* =========================================================
   CLASS HOVER / CLICK
========================================================= */

document
    .getElementById("timetable")
    .addEventListener("click", event => {

        const classBox =
            event.target.closest(".class-box");

        if (!classBox) return;


        const subject =
            classBox.querySelector("b")?.textContent;


        showToast(
            `${subject} class selected`
        );

    });


/* =========================================================
   LOAD SAVED DATA
========================================================= */

loadTimetable();
