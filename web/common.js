// eslint-disable-next-line no-unused-vars
function rpcCmd(elementIdUpdate, command) {
  const updateFn = function (out) {
    document.getElementById(elementIdUpdate).innerText = out;
  };
  rpcCmdFn(updateFn, command);
}

function rpcCmdFn(
  elementIdUpdateFn,
  command,
  filesIn = new Map(),
  filesOut = new Map(),
) {
  // eslint-disable-next-line no-undef
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    // eslint-disable-next-line no-undef
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        elementIdUpdateFn(response.out);
        console.log(response);
      } else {
        console.error("Request failed with status:", xhr.status);
      }
    }
  };

  xhr.open("POST", "/rpc");
  xhr.setRequestHeader("Content-Type", "application/json");
  const data = JSON.stringify({ cmd: command, filesIn, filesOut });
  xhr.send(data);
}

// eslint-disable-next-line no-unused-vars
function rpcCmdFnEx(
  elementIdUpdateFn,
  command,
  filesIn = new Map(),
  filesOut = new Map(),
) {
  // eslint-disable-next-line no-undef
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    // eslint-disable-next-line no-undef
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        elementIdUpdateFn(response);
        console.log(response);
      } else {
        console.error("Request failed with status:", xhr.status);
      }
    }
  };

  xhr.open("POST", "/rpc");
  xhr.setRequestHeader("Content-Type", "application/json");
  const objFilesIn = Object.fromEntries(filesIn);
  const objFilesOut = Object.fromEntries(filesOut);
  const data = JSON.stringify({
    cmd: command,
    filesIn: objFilesIn,
    filesOut: objFilesOut,
  });
  xhr.send(data);
}

// eslint-disable-next-line no-unused-vars
function showBtnSpinner(btnId) {
  document.getElementById(btnId).style.display = "inline-flex";
}

// eslint-disable-next-line no-unused-vars
function hideBtnSpinner(btnId) {
  document.getElementById(btnId).style.display = "none";
}

function parse_str(str) {
  var args = [].slice.call(arguments, 1), 
  i = 0;

  return str.replace(/{}/g, () => args[i++]);
}
