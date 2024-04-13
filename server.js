import puppeteer from 'puppeteer';
import writeXlsxFile from 'write-excel-file/node';
import { app, BrowserWindow, Menu, ipcMain } from  'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import csvWritter from "csv-writer";
import { clearInterval } from 'timers';
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
const createCsvWriter = csvWritter.createObjectCsvWriter;


let textTemplate;
let pageFile$;
let imagePath;
let headers;
let pageMap = new Map();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// import express from "express"; 
// import http from "http";
// import crossOriginResourseSharing from "cors";
// import jsonParser from "body-parser";

// const expressApp = express ();
// expressApp.use(express.json());
// expressApp.use(jsonParser.json());
// expressApp.use(crossOriginResourseSharing());
// const PORT = 8080;
// const server = http.createServer(expressApp);

// server.listen(PORT,  () => {
//   console.log("server listening on 8080");
// })

// let tableRows = await readXlsxFile('./numbersdata.xlsx');
// tableRows = tableRows.slice(1, tableRows.length);
let tableRows;


function removeNonNumeric(input) {
  return +input.replace(/\D/g, '');
}


let win;
// console.log("rows: ", tableRows);

let recieverQue = 0;

let browser;

const HEADER_ROW = [
  {
    id: 'Number',
    title: 'NUMBER'
  },
  {
    id: 'Last Reply',
    title: 'LAST REPLY'
  },
  {
    id: 'Replied Time',
    title: 'REPLIED TIME'
  }
]

// expressApp.post("/start-automation", async (req, res) => {
//   console.log("name locked: ", req.body.reciever);
//   await launchAutomation(req.body.reciever);
// });

// expressApp.get("/get-replied-numbers", async (req, res) => { 
const getReReply = async () => {
  let page;
  if(!browser) {
    browser = await puppeteer.launch({headless: false,  ignoreHTTPSErrors: true,
   defaultViewport: null,
   ignoreDefaultArgs: ['--enable-automation'],
   args: [
       '--disable-infobars',
       '--no-sandbox',
       '--disable-setuid-sandbox',
       '--disable-gpu=False',
       '--enable-webgl',
       '--start-maximized']
      }
      );
  }
  page = await browser.newPage();
  await page.goto('https://web.whatsapp.com/');
  
  await page.waitForSelector('#pane-side', { timeout: 10000000 });
    console.log("loaded");
  await new Promise((resolve) => setTimeout(() => resolve(true), 2000));

  const data = await getRepliedNumbers(page);
  
  return data;
}


const launchAutomation = async (reciever) => {
   browser = await puppeteer.launch({headless: false, executablePath: "/usr/bin/google-chrome-stable",  ignoreHTTPSErrors: true,
   defaultViewport: null,
   ignoreDefaultArgs: ['--enable-automation'],
   args: [
       '--disable-infobars',
       '--no-sandbox',
       '--disable-setuid-sandbox',
       '--disable-gpu=False',
       '--enable-webgl',
       '--start-maximized']
      }
      );
  const page = await browser.newPage();

  await page.goto('https://web.whatsapp.com/');

  // await page.setViewport({width: 1400, height: 900});

/*  await page.waitForSelector('#pane-side', { timeout: 10000000 });
    console.log("loaded");
  await new Promise((resolve) => setTimeout(() => resolve(true), 2000)); */
  pageMap.set('https://web.whatsapp.com/', page);
};

async function startAutomation (reciever) {
  let page = pageMap.get('https://web.whatsapp.com/');
  await page.waitForSelector('#pane-side', { timeout: 10000000 });
  console.log("loaded");
  await new Promise((resolve) => setTimeout(() => resolve(true), 2000));
  return chainMessage(page, reciever, pageFile$);
}


const getRepliedNumbers = async (page) => {
  const numbersData = await page.evaluate (() => {
    let repliedStudents = [];
    let sidePannelContacts = document.getElementById('pane-side');
    let sidePannelList = sidePannelContacts.querySelector("div").querySelector("div").querySelector('div');
      for(let i = 0; i < sidePannelList.children.length; i++){  
        try {
          if(sidePannelList.children[i].querySelector('div').querySelector('div').querySelector('div').children[1].children[1].children[0].children[0].children.length === 1) {
            repliedStudents.push ( {
                number: sidePannelList.children[i].querySelector('div').querySelector('div').querySelector('div').children[1].children[0].children[0].children[0].children[0].textContent,
                lastReply: sidePannelList.children[i].querySelector('div').querySelector('div').querySelector('div').children[1].children[1].children[0].children[0].children[0].textContent,
                when: sidePannelList.children[i].querySelector('div').querySelector('div').querySelector('div').children[1].children[0].children[1].textContent
            } )
        }
      }catch(err){
        null;
      }
      };
       
    return repliedStudents;
  });
  browser.close();
  return numbersData;
};

async function chainMessage (page, reciever, plusImage) {

  console.log("wave length: ", recieverQue, tableRows.length);

  try {
    console.log(tableRows[recieverQue]);
    // ipcMain.emit("on-bulk-completion", "successfully sended all messages!"); 
  }catch (err) {
    win.webContents.send("on-bulk-completion", "successfully sended all messages!"); 
    return browser.close();
  }

  if(recieverQue === tableRows.length){
    win.webContents.send("on-bulk-completion", "successfully sended all messages!"); 
   return browser.close();
  }
  
  await page.evaluate(async (reciever) => {
    console.log("reciever name: ", reciever);
    let tester;
    const repeatitself = () => {
      let done = false;
      let sidePannelContacts = document.getElementById('pane-side');
      let sidePannelList = sidePannelContacts.querySelector("div").querySelector("div").querySelector('div');
      for(let i = 0; i < sidePannelList.children.length; i++){
        if(sidePannelList.children[i].children[0].children[0].children[0].children[1].children[0].children[0].children[0].tagName.toLowerCase("span")){
            if(sidePannelList.children[i].children[0].children[0].children[0].children[1].children[0].children[0].children[0].children.length > 0){
                if(sidePannelList.children[i].children[0].children[0].children[0].children[1].children[0].children[0].children[0].textContent === reciever){
                  tester = sidePannelList.children[i];
                  done = true;
                  break;
                  // return true;
                } 
            }else {
                null;
            }
        } 
      };
      return done;
    };

   new Promise ((resolve) => {
      let interval = setInterval(() => {
        if(repeatitself()) {
          resolve(true);
          clearInterval(interval);
        }
      }, 1000);
  }).then(() => {
    console.log("tester div: ", tester);
    if(tester){
      tester.addEventListener('click', (event) => {
          console.log('just cliked')
      });

      tester.classList.add("pin-sender");
  }
  });
      
  }, reciever);





  const pp = await page.waitForSelector(".pin-sender", {timeout: 10000000});
  await pp.click();

  await new Promise((resolve) => setTimeout(() => resolve(true), 2000));
  async function sendMessage (message, slowDown, sendImage, elite) {
    const input = await page.waitForSelector('[class="selectable-text copyable-text x15bjb6t x1n2onr6"]');
    // await page.waitForSelector('[class="selectable-text copyable-text iq0m558w g0rxnol2"]');
    if(sendImage)  {
    

      let plusIcon = await page.waitForSelector('[class="x11xpdln x1d8287x x1h4ghdb"]');
      
      await plusIcon.click();
      // await page.waitForSelector('[class="erpdyial tviruh8d gfz4du6o r7fjleex lhj4utae le5p0ye3"]');
      // await page.evaluate (() => {
      //   let picture = document.querySelectorAll('[class="erpdyial tviruh8d gfz4du6o r7fjleex lhj4utae le5p0ye3"]');
      //   if(picture) {
      //     picture[1].click();
      //   }
      // });
      //  page.$eval('[class="erpdyial tviruh8d gfz4du6o r7fjleex lhj4utae le5p0ye3"]', (elements, index) => {
      //     if (elements.length > 1) {
      //       elements[1].click();
      //     }
      //   })

      const[fileChooser] = await Promise.all([
        page.waitForFileChooser(),
        page.evaluate (() => {
        let picture = document.querySelectorAll('[class="x1c4vz4f xs83m0k xdl72j9 x1g77sc7 x78zum5 xozqiw3 x1oa3qoh x12fk4p8 xeuugli x2lwn1j x1nhvcw1 x1q0g3np x6s0dn4 x1ypdohk x1vqgdyp x1i64zmx x1gja9t"]');
        if(picture) {
          picture[1].click();
        }
      })
      ])
      const outputDirectory = join(__dirname, 'assets');
      const filePath = join(outputDirectory, imagePath);
      await fileChooser.accept([filePath]);


      await page.evaluate(async () => {

        let repeat = () => {
          let selenium = document.querySelector('[class="x78zum5 x6s0dn4 xl56j7k xexx8yu x4uap5 x18d9i69 xkhd6sd x1f6kntn xk50ysn x7o08j2 xtvhhri x1rluvsa x14yjl9h xudhj91 x18nykt9 xww2gxu xu306ak x12s1jxh xkdsq27 xwwtwea x1gfkgh9 x1247r65 xng8ra"]');
          return selenium;
        }

        await new Promise((r) => {

          let intern = setInterval (() => {
              if(repeat()){
                console.log("approved");
                let changeid = document.querySelector('[class="x1hx0egp x6ikm8r x1odjw0f x1k6rcq7 x1lkfr7t"]');
                changeid.id = "kira";
                  r(true);
                  clearInterval(intern);
              }
          }, 1000);
        });
      });


      const fileinput = await page.waitForSelector('#kira');

      await fileinput.type(message, {delay: 50});
      // await
      // await new Promise((resolve) => setTimeout(() => resolve(true), 5000));
  // await input.type(message, slowDown ? {delay: 100} : {delay: 50});
    // console.log("wait for the file input");

      // const fileinput = await page.$$('[class="selectable-text copyable-text iq0m558w g0rxnol2"]')
    // const fileinput = await page.waitForSelector('[class="to2l77zo gfz4du6o ag5g9lrv fe5nidar kao4egtt"]');
    // console.log("file input file: ", fileinput);
    // await fileinput[1].type(message, {delay: 50});
    /*le.log("Classes of the selected element:", classes);
    await page.type('[class="selectable-text copyable-text iq0m558w g0rxnol2 light-yagami"]', message, {delay: 50});*/
    // await child.type(message);
    
    const sendbtn = await page.waitForSelector('[class="x78zum5 x6s0dn4 xl56j7k xexx8yu x4uap5 x18d9i69 xkhd6sd x1f6kntn xk50ysn x7o08j2 xtvhhri x1rluvsa x14yjl9h xudhj91 x18nykt9 xww2gxu xu306ak x12s1jxh xkdsq27 xwwtwea x1gfkgh9 x1247r65 xng8ra"]');
    await sendbtn.click();
    return;
    }
    // if(elite) {
    //   await input.type(message, slowDown ? {delay: 100} : {delay: 50});
    //   await page.evaluate(async () => {
    //     let timer = 0;
    //     await new Promise((resolver) => {
    //       let intern = setInterval (() => {
    //         if(document.querySelector('[class="x1c4vz4f xs83m0k xdl72j9 x1g77sc7 x78zum5 xozqiw3 x1oa3qoh x12fk4p8 x3pnbk8 xfex06f xeuugli x2lwn1j xl56j7k x1q0g3np x6s0dn4"]')) {
    //           document.querySelector('[class="x889kno x1a8lsjc xbbxn1n xxbr6pl x1n2onr6 x1rg5ohu xk50ysn x1f6kntn xyesn5m x1z11no5 xjy5m1g x1mnwbp6 x4pb5v6 x1i1c1dq x87ea8o x196p5u9 x1t2x6vz x1hl8ikr xfagghw x9dyr19 x9lcvmn x1jrnqrx xiuubft xa2vszz xx5tys9 x5iuykv xlwc9sh x12bbwn8 xcjl5na xnk0c1z x4b7akx x1ao7u56 xhsoqjx x1kwr8ib xuxw1ft xv52azi"]').click();
    //           resolver(true);
    //           clearInterval(intern)
    //         }
    //         if(timer > 49) {
    //           resolver(true);
    //           clearInterval(intern)
    //         }
    //         timer++;
    //       }, 100)
    //     });
    //   });
    // }
    await input.type(message, slowDown ? {delay: 100} : {delay: 50});
    console.log("i typed this: ", message);
    const sendButton = await page.waitForSelector('[class="x1c4vz4f x2lah0s xdl72j9 xfect85 x1iy03kw x1lfpgzf"]', {timeout: 10000000})
    await sendButton.click();
  }
    if(recieverQue === 0){
      for(let i = 0; i < tableRows.length; i++){
          await sendMessage(`+${String(tableRows[i].number)}`, true, false);
      }
    }
  // const input = await page.waitForSelector('[class="selectable-text copyable-text iq0m558w g0rxnol2"]')
  // await input.type(myNumber);
  // await new Promise((resolve) => setTimeout(() => resolve(true), 1000));
  await page.evaluate(async (recieverQue) => {


  //  async function sendMessage () {
  //     const input = await page.waitForSelector('[class="selectable-text copyable-text iq0m558w g0rxnol2"]')
  //     await input.type(message);
  //     const sendButton = await page.waitForSelector('[class="tvf2evcx oq44ahr5 lb5m6g5c svlsagor p2rjqpw5 epia9gcq"]')
  //     await sendButton.click();
  //   }
     
   
    function stringMatchFix(numbersOnly) {
      numbersOnly = removeDashFromString(numbersOnly);
      let output = '';
      let dontpush = false;
      let counter = 0;
      for(let i = 0; i < numbersOnly.length; i++){
          if(!isNaN(numbersOnly[i]) && numbersOnly[i + 1] === " " && !isNaN(numbersOnly[i + 2])){
              dontpush = true;
              output += `${numbersOnly[i]}${numbersOnly[i + 2]}`;
          }
          if(counter == 2){
              dontpush = false;
              counter = 0;
              continue;
          }
          if(!dontpush)output += numbersOnly[i];
          if(dontpush)counter++;
      }
    
      return output;
    }
    function removeDashFromString(str) {
      return str.replace(/-/g, '');
    }

      let anhors = document.querySelectorAll("a");
      // for(let j = 0; j < anhors.length; j++){
      try {  
        anhors[recieverQue].click();
      }catch (err) {
        await new Promise ((resolve) => {
          let int = setInterval(() => {
            anhors = document.querySelectorAll("a");
            if(anhors[recieverQue].click){
              resolve(true);
              clearInterval(int);
            }
          }, 1000);
        });

        anhors[recieverQue].click();
      }
        // await new Promise((resolve) => setTimeout(() => resolve(true), 10000));
        await new Promise ((resolve) => {
          let int = setInterval(() => {
            if(document.querySelector('[class="_aj-r _aj-q _aj-_"]')){
              resolve(true);
              clearInterval(int);
            }
          }, 1000);
        })
        // await new Promise((resolve) => setTimeout(() => resolve(true), 2000));
        let allspans = document.querySelectorAll('span');  
        // for(let i = 0; i < anhors.length; i++){
              let asendingNumber = removeDashFromString(anhors[recieverQue].textContent);
              let div;
              for(let i = 0; i < allspans.length; i++){
                console.log("comparasion: ", stringMatchFix(allspans[i].textContent), `Chat with ${asendingNumber}Copy phone number`)
                if(stringMatchFix(allspans[i].textContent) === `Chat with ${asendingNumber}Copy phone number`){
                    div = allspans[i];
                    break;
                }
              }
            try {
              let actualDiv = div.querySelector('div');
              let ul = actualDiv.querySelector('ul');
              let underuldiv = ul.querySelector('div')
              let firstDiv = underuldiv.querySelectorAll('li');
              firstDiv[0].click();
              await new Promise ((r) => {
                const repeat = () => {
                  let quickScan = document.querySelectorAll('span'); 
                  let popup = false;
                    for(let i = 0; i < quickScan.length; i++){
                        if(quickScan[i].textContent === "Starting chatCancel") {
                          popup = true;
                          console.log(quickScan[i].textContent)
                          break;
                        }
                    }
                    console.log(popup, "still going on ");
                    return popup;
                  };
                  let intern = setInterval(() => {
                    if(repeat()){
                      r(true);
                      clearInterval(intern);
                    }
                  }, 100)
              });

              await new Promise ((r) => {
                const repeat = () => {
                let quickScan = document.querySelectorAll('span'); 
                let popup = false;
                  for(let i = 0; i < quickScan.length; i++){
                      if(quickScan[i].textContent === "Starting chatCancel") {
                        popup = true;
                        console.log(quickScan[i].textContent)
                        break;
                      }
                  }
                  return popup;
                };
                let intern = setInterval(() => {
                  if(!repeat()){
                    r(true);
                    clearInterval(intern);
                  }
                }, 100)
              });
            }catch (err) {
              console.log("error getting chat: ", err);
            }
        // }
    // }
  }, recieverQue);
  // await new Promise((resolve) => setTimeout(() => resolve(true), 2000));
  await page.evaluate(async (dfocus) => {
    await new Promise((resolve) => {
     async function focusOnTextarea() {
        const textarea = document.querySelector('[class="x1hx0egp x6ikm8r x1odjw0f x1k6rcq7 x6prxxf"]');
        if (textarea) {
          !dfocus ? textarea.focus() : null;
          resolve(true);
        }
      }
      const intervalId = setInterval(focusOnTextarea, 100); 
    });
  }, plusImage);

  
  // await page.waitForSelector('[class="to2l77zo gfz4du6o ag5g9lrv bze30y65 kao4egtt"]');
  // await page.waitForSelector('[class="tvf2evcx oq44ahr5 lb5m6g5c svlsagor p2rjqpw5 epia9gcq"]')

  const currentTemplate = textTemplate.split(" ").map(word => {
    if (word.charAt(0) === "@")  {
      const header = word.slice(1).toLowerCase();
      if (headers.includes(header)) {
        return tableRows[recieverQue][header];
      }
    }
    return word;
  }).join(" ");
  
  await sendMessage(currentTemplate, false, plusImage, true);
  recieverQue++;

  return chainMessage(page, reciever, true);
}

const isMac = process.platform === 'darwin'

const template = [
  // { role: 'appMenu' }
  ...(isMac
    ? [{
        label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      }]
    : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      isMac ? { role: 'close' } : { label: 'open csv file', click: () => {
          // ipcMain.emit("open-csv-file", "*/*");
          win.webContents.send("open-csv-file", "*/*");
      }, accelerator: "Ctrl+O" },
      { label: 'quit application', click: () => {
        // ipcMain.emit("really-quit-application", "...");
        win.webContents.send("really-quit-application", "...");
      }, accelerator: "Ctrl+Q" }
    ]
  },
  // { role: 'editMenu' 
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac
        ? [
            { type: 'separator' },
            { role: 'front' },
            { type: 'separator' },
            { role: 'window' }
          ]
        : [
            { role: 'close' }
          ])
    ]
  },
  // Add your custom submenu here
  {
    label: 'Automation',
    submenu: [
      {
        label: 'Start Automation',
        click: () => {
          // Code to start automation
        }
      },
      {
        label: 'Retrieve Replied Numbers',
        click: () => {
          // Code to retrieve replied numbers
        }
      },
      {
        label: 'Select CSV File',
        click: () => {
          // Code to select CSV file
        }
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://electronjs.org')
        }
      }
    ]
  }
]
const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)


function createWindow () {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })
  ipcMain.on('asynchronous-message', (event, arg) => {
    console.log(arg) // prints "ping" in the Node consol 
     launchAutomation(arg);
    // works like `send`, but returning a message back
    // to the renderer that sent the original message
    // event.reply('asynchronous-reply', 'pong')
  });
  
  ipcMain.on("start-sending", (event, arg) => {    
    startAutomation(arg);
  })


  ipcMain.on("send-image-path", (event, rows) => {
    imagePath = rows.path;
    pageFile$ = true;
    event.reply("path-added", "successfully added");
  });

  

  ipcMain.on("send-csv", (event, rows) => {
    tableRows = rows;
    tableRows = tableRows.slice(1, tableRows.length);

    let headersToBeAdded = headers.split(",").map((word) => word.toLowerCase().trim());

    headers = [...headersToBeAdded];

    let indexs = [];
  
    for(let k = 0; k < rows[0].length; k++) {
      headersToBeAdded.forEach(word => {
        if(rows[0][k].toLowerCase() === word) {
          indexs.push(k);
        } 
      });
      
    }
    /*tableRows = tableRows.map((rw) => {

      return [removeNonNumeric(String(rw[0])), rw[1]]
    }); */
    tableRows = [];
    for(let i = 1; i < rows.length; i++) {
      let data = {};
      for(let j = 0; j < rows[i].length; j++) {
          if(indexs.includes(j)) {
            data[headersToBeAdded[j]] = headersToBeAdded[j] === "number" ? removeNonNumeric(String(rows[i][j])) : rows[i][j];
          }
      }
      if(data.hasOwnProperty("number")) {
        tableRows.push(data);
      }
    };
    event.reply("csv-reply", "successfully attached");
    console.log("table datas: ", tableRows);
    

  });

  ipcMain.on("set-headers", (event, code) => {
    headers = code;
    event.reply("headers-setted", "success");
  })
  
  ipcMain.on("get-reply", async (event, code) => {
    const bundledData = await getReReply();
    const dataSetForXlsx = bundledData.map((rw) => {
      return {
        "Number": rw.number,
        "Last Reply": rw.lastReply,
        "Replied Time": rw.when
      }
    });

    // dataSetForXlsx.unshift(HEADER_ROW);
    const outputDirectory = join(__dirname, 'dist');
    const filePath = join(outputDirectory, `${String(new Date())}.xlsx`);
    // await writeXlsxFile(dataSetForXlsx, {
    //   fileName: filePath
    // })
    
    const csvWriter = createCsvWriter({
      path: filePath,
      header: HEADER_ROW,
  });

    csvWriter.writeRecords(dataSetForXlsx) 
    .then(() => {
      event.reply("csv-file-saved", "file saved");
    }).catch(err => {
      console.log(err);
    });
  }); 


  ipcMain.on("quit-the-application", (event, message) => {
    app.quit();
  })

  ipcMain.on("set-text", (event, message) => {
      textTemplate = message;

      event.reply("reply-message", "message added");
  });

  win.loadFile('./frontend/index.html');
  // win.webContents.openDevTools(true);
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});
