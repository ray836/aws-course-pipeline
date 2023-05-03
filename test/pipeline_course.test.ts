import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { ServiceStack } from '../lib/constructs/service-stack';
import { PipelineCourseStack } from '../lib/pipeline_course-stack';
// import { CodePipeline } from 'aws-cdk-lib/aws-codepipeline';
// import { CodePipeline } from 'aws-cdk-lib/aws-events-targets';
// import { Template } from 'aws-cdk-lib/assertions';
// import * as PipelineCourse from '../lib/pipeline_course-stack';

test('Pipeline Stack', () => {
	const app = new cdk.App();
	const stack = new PipelineCourseStack(app, 'MyTestStack');

	const template = Template.fromStack(stack);
	expect(template.toJSON()).toMatchSnapshot();

})

test("Adding service stage", () => {
	// Given
	const app = new cdk.App();
	const serviceStack = new ServiceStack(app, "ServiceStack");
	const pipelineStack = new PipelineCourseStack(app, "PipelineStack");

	// When
	pipelineStack.addServiceStage(serviceStack, "Test");

	// Then
	Template.fromStack(pipelineStack).hasResourceProperties("AWS::CodePipeline::Pipeline",
	{
		Stages: Match.arrayWith([Match.objectLike({Name: "Test"})])
	})
});