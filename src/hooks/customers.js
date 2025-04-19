import config from "../config";

export async function getCustomers({ page, status, limit}) {
  const params = new URLSearchParams();
  params.set("isSuspended", status);
  params.set("limit", limit)
  const skip = (page - 1) * limit;
  if (skip > 0) {
    params.set("skip", skip)
  }
  const response = await fetch(config.API_BASE + "/management/customers/list?" + params.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include"
  })

  const { customers, counts } = await response.json()

  const formattedCustomers = customers.map(({ customerId, ...data }) => (
    {
      customerId,
      data,
      isSelected: false,
      isOpen: {}
    }
  ))
  return { customers: formattedCustomers, counts: counts }
}