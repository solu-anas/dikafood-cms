import { notification, message } from "antd";
import type { ArgsProps as NotificationArgs } from "antd/es/notification/interface";
import type { ArgsProps as MessageArgs } from "antd/es/message/interface";

function safeString(val: any) {
  if (typeof val === "string") return val;
  if (val && typeof val === "object") {
    if (val.message) return String(val.message);
    return JSON.stringify(val);
  }
  return String(val);
}

const feedback = {
  error({ message: msg, description, ...rest }: NotificationArgs) {
    notification.error({
      message: safeString(msg),
      description: safeString(description),
      ...rest,
    });
  },
  success({ message: msg, description, ...rest }: NotificationArgs) {
    notification.success({
      message: safeString(msg),
      description: safeString(description),
      ...rest,
    });
  },
  info({ message: msg, description, ...rest }: NotificationArgs) {
    notification.info({
      message: safeString(msg),
      description: safeString(description),
      ...rest,
    });
  },
  warning({ message: msg, description, ...rest }: NotificationArgs) {
    notification.warning({
      message: safeString(msg),
      description: safeString(description),
      ...rest,
    });
  },
  toastError(content: any, duration?: number) {
    message.error(safeString(content), duration);
  },
  toastSuccess(content: any, duration?: number) {
    message.success(safeString(content), duration);
  },
  toastInfo(content: any, duration?: number) {
    message.info(safeString(content), duration);
  },
  toastWarning(content: any, duration?: number) {
    message.warning(safeString(content), duration);
  },
  // Helper for Alert props
  alertProps(type: "error" | "success" | "info" | "warning", message: any, description?: any) {
    return {
      type,
      message: safeString(message),
      description: safeString(description),
      showIcon: true,
    };
  },
};

export default feedback; 