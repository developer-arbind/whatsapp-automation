import puppeteer from 'puppeteer';
import readXlsxFile from 'read-excel-file/node';

let tableRows = await readXlsxFile('./numbersdata.xlsx');
tableRows = tableRows.slice(1, tableRows.length);


function removeNonNumeric(input) {
  return +input.replace(/\D/g, '');
}

tableRows = tableRows.map((rw) => {
  return [removeNonNumeric(String(rw[0])), rw[1]]
});

console.log("rows: ", tableRows);

let recieverQue = 0;
const reciever = "Ramu";


let browser;
(async () => {
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

  await page.waitForSelector('#pane-side', { timeout: 100000 });
    console.log("loaded");
  await new Promise((resolve) => setTimeout(() => resolve(true), 2000));

  return chainMessage(page, reciever);
})();


const getRepliedNumbers = async (page) => {
  const numbersData = await page.evaluate (() => {
    let repliedStudents = [];
    let sidePannelContacts = document.getElementById('pane-side');
    let sidePannelList = sidePannelContacts.querySelector("div").querySelector("div").querySelector('div');
      for(let i = 0; i < sidePannelList.children.length; i++){    if(sidePannelList.children[i].querySelector('div').querySelector('div').querySelector('div').children[1].children[1].children[0].children[0].children.length === 1) {
            repliedStudents.push ( {
                number: sidePannelList.children[i].querySelector('div').querySelector('div').querySelector('div').children[1].children[0].children[0].children[0].children[0].textContent,
                lastReply: sidePannelList.children[i].querySelector('div').querySelector('div').querySelector('div').children[1].children[1].children[0].children[0].children[0].textContent,
                when: sidePannelList.children[i].querySelector('div').querySelector('div').querySelector('div').children[1].children[0].children[1].children[0].textContent
            } )
        }
      };
       
    return repliedStudents;
  });

  return numbersData;
};

async function chainMessage (page, reciever) {

  console.log("wave length: ", recieverQue, tableRows.length);

  try {
    console.log(tableRows[recieverQue][1]);
  }catch (err) {
    return browser.close();
  }

  if(recieverQue === tableRows.length) return browser.close();
  
  await page.evaluate(async (reciever) => {
    console.log("reciever name: ", reciever);
    let sidePannelContacts = document.getElementById('pane-side');
    let sidePannelList = sidePannelContacts.querySelector("div").querySelector("div").querySelector('div');
    let tester;
    const repeatitself = () => {
      for(let i = 0; i < sidePannelList.children.length; i++){
        if(sidePannelList.children[i].children[0].children[0].children[0].children[1].children[0].children[0].children[0].tagName.toLowerCase("span")){
            if(sidePannelList.children[i].children[0].children[0].children[0].children[1].children[0].children[0].children[0].children.length > 0){
                if(sidePannelList.children[i].children[0].children[0].children[0].children[1].children[0].children[0].children[0].textContent === reciever){
                  tester = sidePannelList.children[i];
                  // break;
                  return true;
                } 
            }else {
                null;
            }
        } 
        return false;
      };
    };
    
    let timer = 0;

    await new Promise ((resolve) => {
      let interval = setInterval (() => {
        if(repeatitself()) {
          resolve(true);
          clearInterval(interval);
        }
        timer++;
      }, 1000);
  });
      
        console.log("tester div: ", tester);
    if(tester){
      tester.addEventListener('click', (event) => {
          console.log('just cliked')
      });

      tester.classList.add("pin-sender");
  }
  }, reciever);


  const pp = await page.waitForSelector(".pin-sender", {timeout: 600000});
  await pp.click();

  async function sendMessage (message) {
     const input = await page.waitForSelector('[class="selectable-text copyable-text iq0m558w g0rxnol2"]');
    await input.type(message);
    console.log("i typed this: ", message);
    const sendButton = await page.waitForSelector('[class="tvf2evcx oq44ahr5 lb5m6g5c svlsagor p2rjqpw5 epia9gcq"]', {timeout: 5000000})
    await sendButton.click();
  }
    // if(recieverQue === 0){
      // for(let i = 0; i < tableRows.length; i++){
  await sendMessage(`+${String(recieverQue[i][0])}`);
      // }
    // }
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
        console.log("something error");
      }
        // await new Promise((resolve) => setTimeout(() => resolve(true), 10000));
        await new Promise ((resolve) => {
          let int = setInterval(() => {
            if(document.querySelector('[class="jScby Iaqxu FCS6Q"]')){
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
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      function focusOnTextarea() {
        const textarea = document.querySelector('[class="to2l77zo gfz4du6o ag5g9lrv bze30y65 kao4egtt"]');
        if (textarea) {
          textarea.focus();
          resolve(true);
        }
      }
      
      const intervalId = setInterval(focusOnTextarea, 100); 
    });
  });  
  // await page.waitForSelector('[class="to2l77zo gfz4du6o ag5g9lrv bze30y65 kao4egtt"]');
  // await page.waitForSelector('[class="tvf2evcx oq44ahr5 lb5m6g5c svlsagor p2rjqpw5 epia9gcq"]')
  await sendMessage(`Hello, ${tableRows[recieverQue][1]}, I am testing my whatsapp automation, thank you!`);
  recieverQue++;

  return chainMessage(page, reciever);
}
