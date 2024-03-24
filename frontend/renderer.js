const { ipcRenderer } = require('electron/renderer')
const readXlsxFile = require('read-excel-file');

const input = document.getElementById("file-input");


const recieverName = document.getElementById("simple-search");
    const startAutomation = document.getElementById("start-automation");
    const getUnRepliedMessage = document.getElementById("start-getting-unrepliedmessages");

    startAutomation.addEventListener("click", (event) => {
        event.preventDefault();
        ipcRenderer.send('asynchronous-message', recieverName.value)
    })

getUnRepliedMessage.addEventListener("click", (event) => {
    event.preventDefault();
    ipcRenderer.send("get-reply", "&&$<.>");
});

input.addEventListener("change", (event) => {
    const file = input.files[0];
    event.preventDefault();
    readXlsxFile(file).then((rows) => {
        ipcRenderer.send("send-csv", rows);
      })
});;


ipcRenderer.on("csv-reply", (_event, message) => {
    alert(message);
});

ipcRenderer.on("csv-file-saved", (_event, message) => {
    alert(message);
})

ipcRenderer.on("on-bulk-completion", (_event, message) => {
    alert(message);
})

ipcRenderer.on("open-csv-file", (_event, message) => {
    // alert("something")
    input.click();
        
});


ipcRenderer.on("really-quit-application", (_event,message) => {
    const confirmTheUser = confirm("really want to close the application");
    if(confirmTheUser) {
        ipcRenderer.send("quit-the-application", "true"); 
    }
});





