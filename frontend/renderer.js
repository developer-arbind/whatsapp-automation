const { ipcRenderer } = require('electron/renderer')
const readXlsxFile = require('read-excel-file');

const input = document.getElementById("file-input");
let serverless = false;

const recieverName = document.getElementById("simple-search");

const textTemplate = document.getElementById("comment-text");
const addMessageBtn = document.getElementById("add-message");
const excelThing = document.getElementById("excel-thing");
const simpleSearch = document.querySelector(".simple-search");
const addHeader = document.querySelector("#add-header");

addHeader.addEventListener("click", event => {
    event.preventDefault();

    ipcRenderer.send("set-headers", simpleSearch.value);
});

ipcRenderer.on("headers-setted", (_event, message) => {
    alert(message);
})
// const imagelink = document.getElementById("image-link);

/*gelink.addEventListener('change', (event) => {
    const file = imagelink.files[0];

    const filePath = URL.createObjectURL(file);
    console.log("File path:", filePath);

    ipcRenderer.send("get-inputfile", filePath);
})*/
    const startAutomation = document.getElementById("start-automation");
    const getUnRepliedMessage = document.getElementById("start-getting-unrepliedmessages");

    startAutomation.addEventListener("click", (event) => {
        event.preventDefault();
        if(!serverless) {
            ipcRenderer.send('asynchronous-message', recieverName.value);
            startAutomation.textContent = "Click Start, when ready";
            serverless = true;
        }else { 
            ipcRenderer.send("start-sending", recieverName.value);
            startAutomation.textContent = "Sending....";
        }
    });

    

getUnRepliedMessage.addEventListener("click", (event) => {
    event.preventDefault();
    ipcRenderer.send("get-reply", "&&$<.>");
});

excelThing.addEventListener("change", (event) =>  {
    const file = excelThing.files[0];
    event.preventDefault();
    readXlsxFile(file).then((rows) => {
        ipcRenderer.send("send-csv", rows);
      })
})

input.addEventListener("change", (event) => {
    const name = input.files[0].name;

    ipcRenderer.send("send-image-path", {
        path: name
    });
});

ipcRenderer.on("path-added", (_event, message) => {
    alert(message);
})


addMessageBtn.addEventListener("click", (event) => {
    event.preventDefault();
    ipcRenderer.send("set-text", textTemplate.value);
});

ipcRenderer.on("reply-message", (_event, message) => {
    alert(message);
})



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





