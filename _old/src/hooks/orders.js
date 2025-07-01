import config from "../config";

export async function getOrders({ page, status, limit, isActiveFilter, filters }) {
  const params = new URLSearchParams();
  params.set("option", status);
  params.set("limit", limit)
  const skip = (page - 1) * limit;
  if (skip > 0) {
    params.set("skip", skip)
  }
  if (isActiveFilter && filters.length !== 0) {
    params.set('filters', JSON.stringify({ "payment": filters }))
}
  const response = await fetch(config.API_BASE + "/management/orders/list?" + params.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include"
  })

  const { orders, counts } = await response.json()

  const formattedOrders = orders.map(({ orderId, ...data }) => (
    {
      orderId,
      data,
      isSelected: false,
      isOpen: {}
    }
  ))
  return { orders: formattedOrders, counts: counts }
}