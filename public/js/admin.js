const deleteProd = btn => {
  const prodId = btn.parentNode.querySelector("[name=productID]").value;
  const csrf = btn.parentNode.querySelector("[name=_csrf]").value;

  const productCard = btn.closest("article");
  console.log(productCard.parentNode);
  fetch("/admin/delete/" + prodId, {
    method: "DELETE",
    headers: { "csrf-token": csrf }
  })
    .then(result => {
      return result.json();
    })
    .then(data => {
      console.log(data);
      productCard.parentNode.removeChild(productCard);
    })
    .catch(err => {
      console.log(err);
    });
};
