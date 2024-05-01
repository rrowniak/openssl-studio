const CHECK_CERT_CMD = "openssl x509 -in {} -text -noout";

function valOnLoad() {
  // update the openssl command display
  $("#val_vert_code").text(genValCmd())
}

function genValCmd() {
  return  parse_str(CHECK_CERT_CMD, "cert_to_val.pem");
}

function validatex509Cert() {
  const x509cert = $("#valx509Cert").val();
  const inFile = new Map();
  inFile.set("cert_to_val.pem", x509cert);
  rpcCmdFnEx(
    function (out) {
      $("textarea#cert_validation_result").text(out.out);
    },
    genValCmd(),
    inFile,
  );
}
