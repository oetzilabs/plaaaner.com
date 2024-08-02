/* tslint:disable */
/* eslint-disable */
import "sst"
declare module "sst" {
  export interface Resource {
    "Api": {
      "type": "sst.aws.ApiGatewayV2"
      "url": string
    }
    "Auth": {
      "publicKey": string
      "type": "sst.aws.Auth"
    }
    "AuthAuthenticator": {
      "name": string
      "type": "sst.aws.Function"
      "url": string
    }
    "DatabaseUrl": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "EmailFrom": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "GoogleClientId": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "GoogleClientSecret": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "LoginEnabled": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "Notifications": {
      "arn": string
      "type": "sst.aws.SnsTopic"
    }
    "SolidStartApp": {
      "type": "sst.aws.SolidStart"
      "url": string
    }
    "Storage": {
      "name": string
      "type": "sst.aws.Bucket"
    }
    "Websocket": {
      "managementEndpoint": string
      "type": "sst.aws.ApiGatewayWebSocket"
      "url": string
    }
    "WithEmail": {
      "type": "sst.sst.Secret"
      "value": string
    }
  }
}
export {}
