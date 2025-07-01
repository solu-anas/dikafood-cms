import config from "../config";

export async function getReviews({ page, status, limit }) {
  const params = new URLSearchParams();
  params.set("isSuspended", status);
  params.set("limit", limit)
  const skip = (page - 1) * limit;
  if (skip > 0) {
    params.set("skip", skip)
  }
  const response = await fetch(config.API_BASE + "/management/reviews/list?" + params.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include"
  })

  const { reviews, counts } = await response.json()

  const formattedReviews = reviews.map(({ reviewId, ...data }) => (
    {
      reviewId,
      data,
      isSelected: false,
      isOpen: {}
    }
  ))
  return { reviews: formattedReviews, counts: counts }
}