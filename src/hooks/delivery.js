import config from "../config";

export async function getDeliveryMethods({ page, status, limit}) {
  const params = new URLSearchParams();
  params.set("isSuspended", status);
  params.set("limit", limit)
  const skip = (page - 1) * limit;
  if (skip > 0) {
    params.set("skip", skip)
  }
  const response = await fetch(config.API_BASE + "/management/delivery-methods/list?" + params.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include"
  })

  const { deliveryMethods, counts } = await response.json()

  const formattedDeliveryMethods = deliveryMethods.map(({ deliveryMethodId, ...data }) => (
    {
      deliveryMethodId,
      data,
      isSelected: false,
      isOpen: {}
    }
  ))
  return { deliveryMethods: formattedDeliveryMethods, counts: counts }
}