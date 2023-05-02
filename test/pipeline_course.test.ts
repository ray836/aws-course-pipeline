import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
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