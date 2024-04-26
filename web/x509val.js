const CHECK_CERT_CMD = "openssl x509 -in %s -text -noout";

function validatex509Cert() {
  const x509cert = $("#valx509Cert").val();
  const inFile = new Map();
  inFile.set("cert_to_val.pem", x509cert);
  const cmd = parse_str(CHECK_CERT_CMD, "cert_to_val.pem");
  // rpcCmd("cert_validation_result", cmd);
  rpcCmdFnEx(
    function (out) {
      $("textarea#cert_validation_result").text(out.out);
    },
    cmd,
    inFile,
  );
}
