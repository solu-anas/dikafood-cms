import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Alert } from "antd";
import feedback from "../../utils/feedback";

export const UserEdit: React.FC = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Alert
        {...feedback.alertProps("info", "User Edit", "Edit user information. Some fields may be restricted based on permissions.")}
        style={{ marginBottom: "16px" }}
      />
      
      <Form {...formProps} layout="vertical">
        <Form.Item label="First Name" name="firstName">
          <Input />
        </Form.Item>
        
        <Form.Item label="Last Name" name="lastName">
          <Input />
        </Form.Item>
        
        <Form.Item label="Email" name="email">
          <Input />
        </Form.Item>
        
        <Form.Item label="Phone" name="phone">
          <Input />
        </Form.Item>
      </Form>
    </Edit>
  );
}; 