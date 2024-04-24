const CMD_RSA_KEYGEN = "openssl genrsa";
const CMD_RSA_PUBKEYGEN =
  "openssl rsa -in key.pem -outform PEM -pubout 2>/dev/null";

const CMD_EC_KEYGEN = "openssl ecparam -name prime256v1 -genkey -noout";
const CMD_EC_PUBKEYGEN = "openssl ec -in key.pem -pubout 2>/dev/null";

// eslint-disable-next-line no-unused-vars
function keyGenOnLoad() {
  updateGenKeyCmdFields();
  hideBtnSpinner("btn-genkey");
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
  return CMD_EC_KEYGEN;
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
