const {ipcRenderer} = require('electron')
const {dialog} = require('electron').remote

const COLLECTOR_PORT_IDX = 0; // Collector port ID always 0
//******************************************************************************
//   System Configuration
//******************************************************************************

function fillOptions(dataArray) {
  var options = '';

  for (var i = 0; i < dataArray.length; i++) {
    options += '<option value="' + dataArray[i] + '" />';
  }
  return options
}

// Baud rate
var baudRates = [9600, 14400, 19200, 38400, 57600, 115200];
document.getElementById('baurdrates').innerHTML = fillOptions(baudRates);

//******************************************************************************
//   Serial Handler
//******************************************************************************
/*******************************************************************************
Function:
  ()
Input Parameters:
  ---
Output Parameters:
  ---
Description:
  ---
Notes:
  ---
Author, Date:
  Toan Huynh, 11/05/2021
*******************************************************************************/
function connectReq(portIdx, portBtn, type) {
  portBtn.disabled = true;

  let event = 'connect';

  if(portBtn.innerHTML === 'Connect'){
    event = 'connect';
  } else {
    event = 'disconnect';
  }

  const reply = ipcRenderer.sendSync("serial-event", {
    event: event,
    port: parseInt(document.getElementById("port-" + portIdx).value),
    baudRate: parseInt(document.getElementById("baudrate-" + portIdx).value),
    portID: "port-" + portIdx,
    type: type
  });

  console.log(reply);

  portBtn.disabled = false

  if (reply && reply.status === "connected") {
    portBtn.innerHTML = "Disconnect";
    return true;
    
  } else if (reply && reply.status === "disconnected") {
    portBtn.innerHTML = "Connect";
    return false;
  }

}
/*******************************************************************************
Function:
  ()
Input Parameters:
  ---
Output Parameters:
  ---
Description:
  ---
Notes:
  ---
Author, Date:
  Toan Huynh, 11/05/2021
*******************************************************************************/
function checkPortConnected(portIdx, portBtn){

  const reply = ipcRenderer.sendSync("serial-event", {
    event: 'check-port',
    portID: "port-" + portIdx,
  });

  if (reply && reply.status === "connected") {
    portBtn.innerHTML = "Disconnect";
    return true;
  } else if (reply && reply.status === "disconnected") {
    portBtn.innerHTML = "Connect";
    return false;
  }
}


/*******************************************************************************
Function:
  ()
Input Parameters:
  ---
Output Parameters:
  ---
Description:
  ---
Notes:
  ---
Author, Date:
  Toan Huynh, 11/05/2021
*******************************************************************************/
function actionReq(portIdx, req) {
  if (portIdx != COLLECTOR_PORT_IDX) {
    return;
  }

  if(req){
    const reply = ipcRenderer.sendSync("serial-req", req);
    console.log(reply);
  
    if(reply.status != "success") {
      dialog.showErrorBox(reply.log, '')
    } 
  } else {
    dialog.showErrorBox(`Argument is invalid!` , '')
  }
}

/*******************************************************************************
Function:
  ()
Input Parameters:
  ---
Output Parameters:
  ---
Description:
  ---
Notes:
  ---
Author, Date:
  Toan Huynh, 11/05/2021
*******************************************************************************/
function showOnScreen(portID, data){
  var textarea = document.getElementById(portID + "-screen");
  textarea.innerHTML += "\n" + data;
  textarea.scrollTop = textarea.scrollHeight;
}

//******************************************************************************
//   EVENT HANDLER
//******************************************************************************
ipcRenderer.on('serial-event', (event, arg) => {
  console.log(arg);
  
  if(arg.event === 'list'){
    document.getElementById('ports').innerHTML = fillOptions(arg.data);
  }
})

//******************************************************************************
//   EXport
//******************************************************************************
module.exports = {
  connectReq,
  checkPortConnected,
  actionReq,
  showOnScreen,
  fillOptions,
};

