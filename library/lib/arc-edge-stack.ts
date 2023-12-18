/* eslint-disable no-new */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/prefer-default-export */
import { Fn, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import {
  Code,
  Function,
  FunctionUrlAuthType,
  Runtime,
} from "aws-cdk-lib/aws-lambda";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import { HttpOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { AdobeEDS } from "cdk-adobe-eds";

interface ArcEdgeStackProps extends StackProps {
  prefix: string;
  edsURL: string;
}

export class ArcEdgeStack extends Stack {
  constructor(scope: Construct, id: string, props: ArcEdgeStackProps) {
    super(scope, id, props);

    const cacheBucket = new Bucket(this, `${props.prefix}-cache-bucket`, {
      publicReadAccess: false,
      bucketName: `${props.prefix}-arc-edge-cache-bucket`,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const helloFunction = new cloudfront.experimental.EdgeFunction(
      this,
      "hello-arc",
      {
        runtime: Runtime.NODEJS_LATEST,
        handler: "index.handler",
        functionName: `${props.prefix}-hello-arc`,
        code: Code.fromAsset("./apps/hello-arc/dist/"),
      }
    );

    cacheBucket.grantReadWrite(helloFunction);

    const headerTransformFunction = new cloudfront.experimental.EdgeFunction(
      this,
      "header-transform",
      {
        runtime: Runtime.NODEJS_LATEST,
        handler: "index.handler",
        functionName: `${props.prefix}-header-transform`,
        code: Code.fromAsset("./apps/header-transform/dist/"),
      }
    );

    const commerceDataFunctionAndURL =
      this.createVolatileCommerceDataFunctionAndURL(props.prefix);

    const personalizeEdgeFunctionAndURL =
      this.createEdgePersonalizationFunctionAndURL(props.prefix);

    new AdobeEDS(this, `${props.prefix}-aem-eds`, {
      prefix: props.prefix,
      invalidateAllOnDeploy: true,
      distributionConfig: {
        prefix: props.prefix,
        enableLogging: false,
        sendPushInvalidationHeader: false,
        edsURL: props.edsURL,
        additionalBehaviors: {
          "/_data/commerce/volatile/*": {
            origin: new HttpOrigin(
              Fn.parseDomainName(commerceDataFunctionAndURL.url.url)
            ),
            compress: true,
            edgeLambdas: [
              {
                functionVersion: headerTransformFunction.currentVersion,
                eventType: cloudfront.LambdaEdgeEventType.ORIGIN_RESPONSE,
              },
            ],
          },
          "/_data/personalize/edge/*": {
            origin: new HttpOrigin(
              Fn.parseDomainName(commerceDataFunctionAndURL.url.url)
            ),
            compress: true,
            edgeLambdas: [
              {
                functionVersion:
                  personalizeEdgeFunctionAndURL.function.currentVersion,
                eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
              },
            ],
            // functionAssociations: [
            //   {
            //     function: new cloudfront.Function(
            //       this,
            //       `${props.prefix}-cf-header`,
            //       {
            //         code: cloudfront.FunctionCode.fromFile({
            //           filePath: "./apps/header-transform/dist/index.js",
            //         }),
            //       }
            //     ),
            //     eventType: FunctionEventType.VIEWER_RESPONSE,
            //   },
            // ],
          },
        },
      },
    });
  }

  createVolatileCommerceDataFunctionAndURL = (prefix: string) => {
    // TODO: this should be protected by signing until OAC is supported
    // see: https://github.com/aws/aws-cdk/issues/20090#issuecomment-1179816882
    // see: https://github.com/pwrdrvr/lambda-url-signing
    const commerceDataFunction = new Function(
      this,
      `${prefix}-commerce-data-function`,
      {
        runtime: Runtime.NODEJS_LATEST,
        handler: "index.handler",
        functionName: `${prefix}-volatile-commerce-data`,
        code: Code.fromAsset("./apps/volatile-commerce-data/dist/"),
      }
    );
    const commerceDataFunctionURL = commerceDataFunction.addFunctionUrl({
      // TODO: This should be swapped to IAM type, and then we need an edge function to handle this
      // see: https://github.com/pwrdrvr/lambda-url-signing
      authType: FunctionUrlAuthType.NONE,
    });

    return {
      function: commerceDataFunction,
      url: commerceDataFunctionURL,
    };
  };

  createEdgePersonalizationFunctionAndURL = (prefix: string) => {
    // TODO: this should be protected by signing until OAC is supported
    // see: https://github.com/aws/aws-cdk/issues/20090#issuecomment-1179816882
    // see: https://github.com/pwrdrvr/lambda-url-signing
    const cfFunction = new Function(this, `${prefix}-personalize-edge`, {
      runtime: Runtime.NODEJS_LATEST,
      handler: "index.handler",
      functionName: `${prefix}-personalize-edge`,
      code: Code.fromAsset("./apps/personalize-edge/dist/"),
    });
    const cfURL = cfFunction.addFunctionUrl({
      // TODO: This should be swapped to IAM type, and then we need an edge function to handle this
      // see: https://github.com/pwrdrvr/lambda-url-signing
      authType: FunctionUrlAuthType.NONE,
    });

    return {
      function: cfFunction,
      url: cfURL,
    };
  };
}
