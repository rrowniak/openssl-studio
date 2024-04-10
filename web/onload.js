window.onload = function () {
  // DIAGNOSTICS
  // eslint-disable-next-line no-undef
  document.getElementById('diag_version_code').innerText = CMD_VERSION
  // eslint-disable-next-line no-undef
  document.getElementById('diag_ciphers_code').innerText = CMD_SUPP_CIPHERS
  // eslint-disable-next-line no-undef
  document.getElementById('diag_trust_cert_path_code').innerText = CMD_TRUST_CERT_PATH
  // eslint-disable-next-line no-undef
  fetchDiagData()

  // KEYGEN
  // eslint-disable-next-line no-undef
  document.getElementById('gen_key_code').innerText = CMD_RSA_KEYGEN
}
