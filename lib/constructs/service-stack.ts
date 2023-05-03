import { Stack, StackProps } from "aws-cdk-lib";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { ApiGateway } from "aws-cdk-lib/aws-events-targets";
import { CfnParametersCode, Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export class ServiceStack extends Stack {
	public readonly serviceCode: CfnParametersCode;
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		this.serviceCode = Code.fromCfnParameters()

		const backend = new Function(this, 'ServiceLambda', {
			runtime: Runtime.NODEJS_18_X,
			handler: 'src/lambda.handler',
			code: this.serviceCode,
			functionName: 'ServiceLambda'
		})

		new LambdaRestApi(this, 'VenApi', {
			handler: backend,
			restApiName: 'VenApi'
		})

	}
}