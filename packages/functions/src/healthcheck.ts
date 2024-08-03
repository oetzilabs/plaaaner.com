import { APIGatewayEvent, Handler } from "aws-lambda";

export const main: Handler<APIGatewayEvent> = async (_evt) => {
  return {
    statusCode: 200,
  };
};
