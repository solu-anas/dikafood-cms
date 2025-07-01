import { Show, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Alert, Spin } from "antd";
import { getErrorMessage } from "../../utils/error";

const { Title } = Typography;

export const CategoryShow = () => {
  const { queryResult } = useShow({});
  const { data, isLoading, isError, error } = queryResult;

  if (isLoading) return <Spin />;
  if (isError) return <Alert message="Error" description={getErrorMessage(error)} type="error" showIcon />;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>{"ID"}</Title>
      <TextField value={record?.id} />
      <Title level={5}>{"Title"}</Title>
      <TextField value={record?.title} />
    </Show>
  );
};
