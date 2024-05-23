const DIGEST_LIST_CMD = "openssl dgst -list";
const LIST_EXT = [
    "extdigitalSignature",
    "extnonRepudiation",
    "extkeyEncipherment",
    "extdataEncipherment",
    "extkeyAgreement",
    "extkeyCertSign",
    "extcRLSign",
    "extencipherOnly",
  ];
const LIST_EXT2 = [
    "extserverAuth",
    "extclientAuth",
    "extcodeSigning",
    "extemailProtection",
    "exttimeStamping",
    "extOCSPSigning",
    "extipsecIKE",
    "extmsCodeInd",
    "extmsCodeCom",
    "extmsCTLSign",
    "extmsEFS",
  ];

function x509CertOnLoad() {
  populateDigestList();
  updatex509GenCodeVal();
  // certExpiryOnChange();
  hideBtnSpinner("btn-genx509");
}

function x509genCert() {
  showBtnSpinner("btn-genx509");
  const files = new Map();
  files.set("key.pem", $("textarea#x509_gen_priv_key").val());
  console.log(files);
  rpcCmdFnEx(
    function (out) {
      $("textarea#gen_x509_cert").text(out.out);
      hideBtnSpinner("btn-genx509");
    },
    genx509Cmd(),
    files,
  );
}

function populateDigestList() {
  rpcCmdFn(function (out) {
    var records = out.match(/[^0-9]-[\w-]+/g);
    records = records.map((record) => record.trim());
    $.each(records, function (i, item) {
      $("#digestList").append(
        $("<option>", {
          value: item,
          text: item,
        }),
      );
      var def = records.includes("-sha256") ? "-sha256" : records[0];
      $("#digestList").val(def);
    });
  }, DIGEST_LIST_CMD);
}

function digestSelectionOnChange() {}

// function certExpiryOnChange() {
//   var daysRatio = $('#x509ExpiryDays').is(":checked");
//   if (daysRatio) {
//     var now = new Date();
//     var from = formatDateForOpenSSL(now);
//     var future = new Date(now.getTime() + parseInt($("#DaysCert").val()) * 24 * 60 * 60 * 1000)
//     var to = formatDateForOpenSSL(future);
//     $("#FromCert").val(from);
//     $("#ToCert").val(to)
//
//     $("#FromCert").attr('disabled', 'disabled');
//     $("#ToCert").attr('disabled', 'disabled');
//     $("#DaysCert").removeAttr('disabled');
//   } else {
//     $("#FromCert").removeAttr('disabled');
//     $("#ToCert").removeAttr('disabled');
//     $("#DaysCert").attr('disabled', 'disabled');
//   }
//   updatex509GenCodeVal();
// }

function updatex509GenCodeVal() {
  $("code#gen_x509_code").text(genx509Cmd());
}

function genx509Cmd() {
  const args = [];
  args.push("openssl");
  args.push("req");
  args.push("-x509");
  args.push("-key key.pem");
  args.push($("#digestList").val());
  args.push(genx509ExpireTimeArg());
  args.push("-nodes");
  args.push('-subj "' + genx509SubjectValueStr() + '"');
  args.push(genx509BasicConst());
  args.push(genx509Extensions());
  // args.push('-addext "subjectAltName=IP:192.168.1.1"');
  args.push(genx509SubAltName());
  args.push(genx509Smartcard());
  return args.join(" ");
}

function genx509ExpireTimeArg() {
  // var daysRatio = $('#x509ExpiryDays').is(":checked");
  // if (daysRatio) {
  return "-days " + $("#DaysCert").val();
  // } else {
  //   return "-not_before " + $("#FromCert").val()
  //     + " -not_after " + $("#ToCert").val();
  // }
}

function genx509BasicConst() {
  const args = [];
  var selected = $("#extbasicConstraints option:selected").text();
  if (selected === "Critical") {
    args.push("critical");
  }
  if (selected !== "Not selected") {
    var ca_opt = $("#ext1basicConstraints option:selected").text();
    args.push(ca_opt);

    var pathlen = $("#extPathlen").val();
    if (pathlen !== "") {
      args.push("pathlen:" + pathlen);
    }
  }
  if (args.length > 0) {
    return "-addext basicConstraints=" + args.join(",");
  }
  return "";
}

function genx509Smartcard() {
  const args = [];
  const args_altname = [];
  var selected = $("#extmsSmartcardLogin option:selected").text();
  if (selected === "Critical") {
    args.push("critical");
  }
  if (selected !== "Not selected") {
    args.push("msSmartcardLogin");
    var principal_name = $("#extPrincipalName").val().trim();
    if (principal_name !== "") {
      args_altname.push("UTF8:" + principal_name);
    }
    var principal_email = $("#extPrincipalMail").val().trim();
    if (principal_email !== "") {
      args_altname.push("email:" + principal_email);
    }
  }
  if (args.length > 0) {
    return (
      "-addext extendedKeyUsage=" +
      args.join(",") +
      ' -addext subjectAltName="otherName:msUPN;' +
      args_altname.join(",") +
      '"'
    );
  }
  return "";
}

function genx509Extensions() {
  const prefix = "keyUsage";
  var ku = genx509ExtCustom(LIST_EXT, prefix);
  const prefix_ext = "extendedKeyUsage";
  var ext = genx509ExtCustom(LIST_EXT2, prefix_ext);
  return ku + " " + ext;
}

function genx509ExtCustom(list, prefix) {
  const args = [];
  for (const l of list) {
    var selected = $("#" + l + " option:selected").text();
    if (selected === "Critical") {
      args.push("critical");
    }
    if (selected !== "Not selected") {
      var propName = $('label[for="' + l + '"]').text();
      args.push(propName);
    }
  }
  if (args.length > 0) {
    return "-addext   " + prefix + "=" + args.join(",");
  }
  return "";
}

function genx509SubAltName() {
  const args = [];
  // IPS
  var ips = ["IP1Cert", "IP2Cert"];
  for (const id of ips) {
    var val = $("#" + id).val();
    if (val.trim() !== "") {
      args.push("IP:" + val);
    }
  }

  var dns = ["DNS1Cert", "DNS2Cert"];
  for (const id of dns) {
    var val = $("#" + id).val();
    if (val.trim() !== "") {
      args.push("DNS:" + val);
    }
  }
  if (args.length == 0) {
    return "";
  }
  return '-addext "subjectAltName=' + args.join(",") + '"';
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

function formatDateForOpenSSL(date) {
  var year = date.getFullYear();
  var month = ("0" + (date.getMonth() + 1)).slice(-2);
  var day = ("0" + date.getDate()).slice(-2);
  var hours = ("0" + date.getHours()).slice(-2);
  var minutes = ("0" + date.getMinutes()).slice(-2);
  var seconds = ("0" + date.getSeconds()).slice(-2);

  return year + month + day + hours + minutes + seconds + "Z";
}

function notSelectedForAllExt() {
  $("#extbasicConstraints").val('Not selected');
  $("#ext1basicConstraints").val('CA:FALSE')
  $("#extPathlen").val("");
  for (const field of LIST_EXT) {
    $("#" + field).val('Not selected')
  //   $('#' + field + ' option').filter(function() {
  //     return $(this).text() === 'Not selected';
  //   }).prop('selected', true);
  }
  for (const field of LIST_EXT2) {
    $("#" + field).val('Not selected')
  }
  $("#extmsSmartcardLogin").val('Not selected');
}

function fillCACert() {
  notSelectedForAllExt();
  $("#extbasicConstraints").val('Critical');
  $("#ext1basicConstraints").val('CA:TRUE')
  $("#extPathlen").val("2");
  $("#extdigitalSignature").val('Selected');
  $("#extkeyCertSign").val('Selected');
  $("#extcRLSign").val('Selected');
}

function fillTlsServCert() {
  notSelectedForAllExt();
  $("#extbasicConstraints").val('Selected');
  $("#ext1basicConstraints").val('CA:FALSE')
  $("#extdigitalSignature").val('Selected');
  $("#extkeyEncipherment").val('Selected');
  $("#extserverAuth").val('Selected');
}

function fillTlsClientCert() {
  notSelectedForAllExt();
  $("#extbasicConstraints").val('Selected');
  $("#ext1basicConstraints").val('CA:FALSE')
  $("#extdigitalSignature").val('Selected');
  $("#extkeyEncipherment").val('Selected');
  $("#extclientAuth").val('Selected');
}

function fillCAint() {
  notSelectedForAllExt();
  $("#extbasicConstraints").val('Critical');
  $("#ext1basicConstraints").val('CA:TRUE')
  $("#extPathlen").val("2");
  $("#extdigitalSignature").val('Selected');
  $("#extkeyCertSign").val('Selected');
  $("#extcRLSign").val('Selected');
}

function fillSmartcard() {
  notSelectedForAllExt();
  $("#extbasicConstraints").val('Selected');
  $("#ext1basicConstraints").val('CA:FALSE')
  $("#extPathlen").val("0");
  $("#extnonRepudiation").val('Critical');
  $("#extdigitalSignature").val('Selected');
  $("#extkeyEncipherment").val('Selected');
  $("#extclientAuth").val('Selected');
  $("#extmsSmartcardLogin").val('Selected');
}
