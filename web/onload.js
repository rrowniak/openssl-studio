function load_tab(name, file, fn = null) {
  var content;
  $.get("web/" + file, function (data) {
    content = data;
    $(name).prepend(content);
    if (fn) {
      fn();
    }
  });
}
function my_onload() {
  load_tab("#myTabContent", "tab_diags.html", function (response, status) {
    // eslint-disable-next-line no-undef
    diagOnLoad();
  });
  load_tab("#myTabContent", "tab_keygen.html", function (response, status) {
    // eslint-disable-next-line no-undef
    keyGenOnLoad();
  });
  load_tab("#myTabContent", "tab_x509val.html");
  load_tab("#myTabContent", "tab_selfsign.html");
  load_tab("#myTabContent", "tab_casign.html");
  load_tab("#myTabContent", "tab_crl.html");
  load_tab("#myTabContent", "tab_tls.html");
}

jQuery(document).ready(function () {
  my_onload();
});

window.onload = function () {
  // onload()
  // console.log("onload");
};
