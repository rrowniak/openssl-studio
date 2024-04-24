const CMD_RSA_KEYGEN = "openssl genrsa";
const CMD_RSA_PUBKEYGEN =
  "openssl rsa -in key.pem -outform PEM -pubout 2>/dev/null";

const CMD_EC_KEYGEN1 = "openssl ecparam -name ";
const CMD_EC_KEYGEN2 = " -genkey -noout";
const CMD_EC_PUBKEYGEN = "openssl ec -in key.pem -pubout 2>/dev/null";

const ECC_CURVE_LIST_CMD = "openssl ecparam -list_curves";

// eslint-disable-next-line no-unused-vars
function keyGenOnLoad() {
  updateGenKeyCmdFields();
  populateECCList();
  hideBtnSpinner("btn-genkey");
}

function populateECCList() {
  rpcCmdFn(function (out) {
    var curveSelect = document.getElementById("eccList");
    // Extract the first element from each record
    var records = out.split("\n");
    var curveNames = records
      .map((record) => {
        var match = record.match(/^\s*(.+?)\s*:\s*(.*)$/);
        return match ? match[1].trim() : null;
      })
      .filter((name) => name !== null); // Remove null values
    // Populate the select list
    curveNames.forEach((curveName) => {
      var option = document.createElement("option");
      option.text = curveName;
      option.value = curveName;
      curveSelect.add(option);
    });
    // Select "prime256v1" if it exists, otherwise the first element
    var defaultCurve = curveNames.includes("prime256v1")
      ? "prime256v1"
      : curveNames[0];
    curveSelect.value = defaultCurve;
  }, ECC_CURVE_LIST_CMD);
}

function getSelectedECC() {
  var curveSelect = document.getElementById("eccList");
  return curveSelect.value;
}

function eccSelectionOnChange() {
  updateGenKeyCmdFields();
}

// eslint-disable-next-line no-unused-vars
function rsaKeySizeOnChange() {
  updateGenKeyCmdFields();
}

// eslint-disable-next-line no-unused-vars
function keyGenTypeOnChange() {
  if (document.getElementById("keyTypeRSA").checked) {
    document.getElementById("keyGenRSAOpts").style.display = "inline";
    document.getElementById("keyGenECOpts").style.display = "none";
  } else if (document.getElementById("keyTypeEC").checked) {
    document.getElementById("keyGenRSAOpts").style.display = "none";
    document.getElementById("keyGenECOpts").style.display = "inline";
  }
  updateGenKeyCmdFields();
}

function buildKeyGenCmd() {
  if (document.getElementById("keyTypeRSA").checked) {
    return buildRsaCommand();
  } else if (document.getElementById("keyTypeEC").checked) {
    return buildECCommand();
  }
}

function buildPubKeyGenCmd() {
  if (document.getElementById("keyTypeRSA").checked) {
    return CMD_RSA_PUBKEYGEN;
  } else if (document.getElementById("keyTypeEC").checked) {
    return CMD_EC_PUBKEYGEN;
  }
}

function buildECCommand() {
  var selected = getSelectedECC();
  return CMD_EC_KEYGEN1 + selected + CMD_EC_KEYGEN2;
}

function buildRsaCommand() {
  let keySize = 2048;
  if (document.getElementById("rsaKeySize4096").checked) {
    keySize = 4096;
  }

  return CMD_RSA_KEYGEN + " " + keySize;
}

function updateGenKeyCmdFields() {
  // eslint-disable-next-line no-undef
  document.getElementById("gen_key_code").innerText = buildKeyGenCmd();
  // eslint-disable-next-line no-undef
  document.getElementById("gen_pubkey_code").innerText = buildPubKeyGenCmd();
}
// eslint-disable-next-line no-unused-vars
function genKey() {
  showBtnSpinner("btn-genkey");
  updateGenKeyCmdFields();
  // eslint-disable-next-line no-undef
  rpcCmdFnEx(function (out) {
    document.getElementById("keygen_result").value = out.out;
    if (out.ret_code === 0) {
      const files = new Map();
      files.set("key.pem", out.out);
      // eslint-disable-next-line no-undef
      rpcCmdFnEx(
        function (out) {
          document.getElementById("pubkeygen_result").value = out.out;
          hideBtnSpinner("btn-genkey");
        },
        buildPubKeyGenCmd(),
        files,
      );
    }
  }, buildKeyGenCmd());
}

function downloadPrivateKey() {
  const privKeyPEM = document.getElementById("keygen_result").value;
  const blob = new Blob([privKeyPEM], { type: "text/plain;charset=utf-8" });
  saveAs(blob, "private-key.pem");
}

function downloadPublicKey() {
  const privKeyPEM = document.getElementById("pubkeygen_result").value;
  const blob = new Blob([privKeyPEM], { type: "text/plain;charset=utf-8" });
  saveAs(blob, "public-key.pem");
}
