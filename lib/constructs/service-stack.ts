import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { LambdaDeploymentConfig, LambdaDeploymentGroup } from "aws-cdk-lib/aws-codedeploy";
import { ApiGateway } from "aws-cdk-lib/aws-events-targets";
import { Alias, CfnParametersCode, Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
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
			functionName: `ServiceLambda-${props.stageName}`,
			description: `Generated on ${new Date().toISOString()}`,
		})

		const alias = new Alias(this, "ServiceLambdaAlias", {
			version: backend.currentVersion,
			aliasName:`ServiceLambdaAlias${props.stageName}`
		})

		const api = new LambdaRestApi(this, 'VenApi', {
			handler: alias,
			restApiName: `VendApi-${props.stageName}`
		})


		if (props.stageName === 'Prod') {
			new LambdaDeploymentGroup(this, "DeploymentGroup", {
				alias: alias,
				deploymentConfig: LambdaDeploymentConfig.CANARY_10PERCENT_5MINUTES
			})
		}


		this.serviceEndpointOutput = new CfnOutput(this, 'ApiEndpointOutput', {
			exportName: `ServiceEndpoint${props.stageName}`,
			value: api.urlForPath(),
			description: 'API Endpoint'
		});

	}
}