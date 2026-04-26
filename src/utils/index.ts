export const genericResponse = (
  data: any = null,
  status: number,
  responseMessage: string,
) => {
  return { data, status, responseMessage };
};
