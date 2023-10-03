// Create the table
let tbody = document.querySelector('#statsBody');

let keys = JSON.parse(localStorage.getItem('keys'));

if (keys) {
    keys.forEach(key => {
        let data = JSON.parse(localStorage.getItem(key));

        // Create a row
        let row = document.createElement('tr');

        // Create and populate the cells
        let dateCell = document.createElement('td');
        dateCell.textContent = key;
        dateCell.classList.add('datetime');
        row.appendChild(dateCell);

        let wpmCell = document.createElement('td');
        wpmCell.textContent = data.wpm;
        wpmCell.classList.add('wpm');
        row.appendChild(wpmCell);

        let accuracyCell = document.createElement('td');
        accuracyCell.textContent = data.accuracy;
        accuracyCell.classList.add('accuracy');
        row.appendChild(accuracyCell);

        let timeCell = document.createElement('td');
        timeCell.textContent = data.time;
        timeCell.classList.add('timeleft');
        row.appendChild(timeCell);

        // Append the row to the table body
        tbody.appendChild(row);
    });
}

// Event listener for the back button
let gobackbtn = document.querySelector("#back-btn");

gobackbtn.addEventListener('click', function () {
    // Redirect to the index page
    window.location.href = "index.html";
});
