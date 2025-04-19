import config from "../config";

export async function getProducts({ page, status, itemPerPage }) {
  const params = new URLSearchParams();
  params.set("isSuspended", status);
  params.set("limit", itemPerPage)
  const skip = (page - 1) * itemPerPage;
  if (skip > 0) {
    params.set("skip", skip)
  }
  const response = await fetch(config.API_BASE + "/management/products/list?" + params.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include"
  })

  const { products, counts } = await response.json()

  const formattedProducts = products.map(({ productId, ...data }) => (
    {
      productId,
      data,
      isSelected: false,
      isOpen: {}
    }
  ))
  return { products: formattedProducts, counts: counts }
}