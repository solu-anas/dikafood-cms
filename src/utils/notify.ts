import { notification } from "antd";

function safeString(val: any) {
  if (typeof val === "string") return val;
  if (val && typeof val === "object") {
    if (val.message) return String(val.message);
    return JSON.stringify(val);
  }
  return String(val);
}

export function safeNotificationError({ message, description, ...rest }: any) {
  notification.error({
    message: safeString(message),
    description: safeString(description),
    ...rest,
  });
} 