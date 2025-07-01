export function getErrorMessage(error: any): string {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  if (error.data && error.data.message) return error.data.message;
  if (error.response && error.response.data && error.response.data.message) return error.response.data.message;
  return "An error occurred";
} 