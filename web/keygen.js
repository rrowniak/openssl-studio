const CMD_RSA_KEYGEN = 'openssl genrsa 2048'

// eslint-disable-next-line no-unused-vars
function genKey () {
  // eslint-disable-next-line no-undef
  rpcCmdFn(function (out) {
    document.getElementById('keygen_result').value = out
  }, CMD_RSA_KEYGEN)
}
