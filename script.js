let classes = JSON.parse(localStorage.getItem("classes")) || [];

// LOAD SAVED CLASSES

classes.forEach(function (savedclass) {
  const item = document.createElement("div");

  item.innerHTML = `
        <strong>${savedclass.subject}</strong><br>
        📅 ${savedclass.day}<br>
        🕰️ ${savedclass.time}<br>
        🏢 ${savedclass.venue}<br><br>
        <button class="deleteButton">🗑️ Delete</button>
    `;

  document.getElementById("classList").appendChild(item);
});

// ADD CLASS

const button = document.getElementById("addButton");

button.addEventListener("click", function () {
  const subject = document.getElementById("subject").value;
  const day = document.getElementById("day").value;
  const time = document.getElementById("time").value;
  const venue = document.getElementById("venue").value;

  if (subject === "") {
    alert("Please enter a subject");
    return;
  }

  const newClass = {
    id: Date.now(),
    subject: subject,
    day: day,
    time: time,
    venue: venue,
  };

  classes.push(newClass);

  localStorage.setItem("classes", JSON.stringify(classes));

  const list = document.getElementById("classList");

  const item = document.createElement("div");

  item.innerHTML = `
        <strong>${subject}</strong><br>
        📅 ${day}<br>
        🕰️ ${time}<br>
        🏢 ${venue}<br><br>
        <button class="deleteButton">🗑️ Delete</button>
    `;

  list.appendChild(item);
  const deleteButton = item.querySelector(".deleteButtton");

  deleteButton.addEventListener("click", function () {
    classes = classes.filter(function (oneClass) {
      return oneClass.id !== newClass.id;
    });

    localStorage.setItem("classes", JSON.stringify(classes));
  });
});
