const CMD_VERSION = 'openssl version'
const CMD_SUPP_CIPHERS = 'openssl ciphers -s -v'
const CMD_TRUST_CERT_PATH = 'openssl version -d'

window.onload = function () {
  document.getElementById('diag_version_code').innerText = CMD_VERSION
  document.getElementById('diag_ciphers_code').innerText = CMD_SUPP_CIPHERS
  document.getElementById('diag_trust_cert_path_code').innerText = CMD_TRUST_CERT_PATH

  fetchDiagData()
}

// eslint-disable-next-line no-unused-vars
function fetchDiagData () {
  rpcCmd('diag_version', CMD_VERSION)
  // rpcCmd('diag_trust_cert_path', CMD_TRUST_CERT_PATH)
  rpcCmdFn(processCertPathContent, CMD_TRUST_CERT_PATH)
  rpcCmdFn(processUpdateCiphers, CMD_SUPP_CIPHERS)
}

function processCertPathContent (out) {
  document.getElementById('diag_trust_cert_path').innerText = out
  let path = document.getElementById('diag_trust_cert_path').innerText
  path = path.replace('OPENSSLDIR:', '').replaceAll('"', '').trim()
  console.log(path)
  rpcCmd('diag_trust_cert_path_cont', 'ls -l ' + path)
}

function processUpdateCiphers (out) {
  const table = document.getElementById('diag_ciphers_table')

  const records = out.split(/\r?\n/)
  for (const r in records) {
    const values = records[r].split(/(\s+)/).filter(function (e) { return e.trim().length > 0 })
    if (values.length !== 6) {
      continue
    }

    const row = table.insertRow(-1)

    const cellCipher = row.insertCell(0)
    cellCipher.innerHTML = values[0]

    const cellTlsVer = row.insertCell(1)
    cellTlsVer.innerHTML = values[1]

    const cellKx = row.insertCell(2)
    cellKx.innerHTML = values[2].replace('Kx=', '')

    const cellAu = row.insertCell(3)
    cellAu.innerHTML = values[3].replace('Au=', '')

    const cellEnc = row.insertCell(4)
    cellEnc.innerHTML = values[4].replace('Enc=', '')

    const cellMac = row.insertCell(5)
    cellMac.innerHTML = values[5].replace('Mac=', '')
  }
}

function rpcCmd (elementIdUpdate, command) {
  const updateFn = function (out) {
    document.getElementById(elementIdUpdate).innerText = out
  }
  rpcCmdFn(updateFn, command)
}

function rpcCmdFn (elementIdUpdateFn, command) {
  // eslint-disable-next-line no-undef
  const xhr = new XMLHttpRequest()
  xhr.onreadystatechange = function () {
    // eslint-disable-next-line no-undef
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText)

        // document.getElementById(elementIdUpdate).innerText = response.out
        elementIdUpdateFn(response.out)
        console.log(response)
      } else {
        console.error('Request failed with status:', xhr.status)
      }
    }
  }

  xhr.open('POST', '/rpc')
  xhr.setRequestHeader('Content-Type', 'application/json')
  const data = JSON.stringify({ cmd: command, files: 'false' })
  xhr.send(data)
}
