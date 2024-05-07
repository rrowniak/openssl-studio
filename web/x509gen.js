const DIGEST_LIST_CMD = "openssl dgst -list";

function x509CertOnLoad() {
  populateDigestList();
  updatex509GenCodeVal();
  hideBtnSpinner("btn-genx509");
}

function x509genCert() {
  showBtnSpinner("btn-genx509");
  const files = new Map();
  files.set("key.pem", $("textarea#x509_gen_priv_key").val());
  console.log(files)
  rpcCmdFnEx(function (out) {
    $("textarea#gen_x509_cert").text(out.out);
    hideBtnSpinner("btn-genx509");
  }, genx509Cmd(), files);
}

function populateDigestList() {
  rpcCmdFn(function (out) {
    var records = out.match(/[^0-9]-[\w-]+/g);
    $.each(records, function (i, item) {
      $("#digestList").append(
        $("<option>", {
          value: item,
          text: item,
        }),
      );
    });
  }, DIGEST_LIST_CMD);
}

function digestSelectionOnChange() {}

function updatex509GenCodeVal() {
  $("code#gen_x509_code").text(genx509Cmd())
}

function genx509Cmd() {
  const args = [];
  args.push("openssl");
  args.push("req");
  args.push("-x509");
  args.push("-key key.pem");
  args.push("-sha256");
  args.push("-days 365");
  args.push("-nodes");
  args.push("-subj \"" + genx509SubjectValueStr() + "\"");
  args.push("-addext \"subjectAltName=IP:192.168.1.1\"");
  return args.join(" ");
}

function genx509SubjectValueStr() {
  const fields = new Map([
    ["CN", "CNCert"],
    ["C", "CountryNCert"],
    ["ST", "StateCert"],
    ["L", "LocCert"],
    ["O", "OrgCert"],
    ["OU", "UnitCert"],
  ]);

  var result = "";

  for (let [k, v] of fields) {
    var val = $("#" + v).val();
    result += ["/", k, "=", val].join("");
  }
  return result;
}
