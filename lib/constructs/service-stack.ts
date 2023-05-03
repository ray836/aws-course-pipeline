import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { ApiGateway } from "aws-cdk-lib/aws-events-targets";
import { CfnParametersCode, Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface ServiceStackProps extends StackProps {
	stageName: string;
}

export class ServiceStack extends Stack {
	public readonly serviceCode: CfnParametersCode;
	public readonly serviceEndpointOutput: CfnOutput;
	constructor(scope: Construct, id: string, props: ServiceStackProps) {
		super(scope, id, props);

		this.serviceCode = Code.fromCfnParameters()

		const backend = new Function(this, 'ServiceLambda', {
			runtime: Runtime.NODEJS_18_X,
			handler: 'src/lambda.handler',
			code: this.serviceCode,
			functionName: `ServiceLambda-${props.stageName}`
		})

		const api = new LambdaRestApi(this, 'VenApi', {
			handler: backend,
			restApiName: `VendApi-${props.stageName}`
		})

		this.serviceEndpointOutput = new CfnOutput(this, 'ApiEndpointOutput', {
			exportName: `ServiceEndpoint${props.stageName}`,
			value: api.urlForPath(),
			description: 'API Endpoint'
		});

	}
}