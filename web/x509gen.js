const DIGEST_LIST_CMD = "openssl dgst -list";

function x509CertOnLoad() {
  populateDigestList();
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
