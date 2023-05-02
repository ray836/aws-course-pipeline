import * as cdk from 'aws-cdk-lib';
import { SecretValue } from 'aws-cdk-lib';
import { BuildSpec, LinuxBuildImage, PipelineProject } from 'aws-cdk-lib/aws-codebuild';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { CloudFormationCreateUpdateStackAction, CodeBuildAction, GitHubSourceAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class PipelineCourseStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new Pipeline(this, 'Pipeline', {
      pipelineName: 'Pipeline-From-Course',
      crossAccountKeys: false
    });

    const sourceOutput = new Artifact('SourceOutput');

    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new GitHubSourceAction({
          owner: 'ray836',
          repo: 'aws-course-pipeline',
          branch: 'main',
          actionName: 'Pipeline_Source',
          oauthToken: SecretValue.secretsManager('github-token'),
          output: sourceOutput
        })
      ]
    });

    const cdkBuildOutput = new Artifact('CdkBuildOutput');

    pipeline.addStage({
      stageName: "Build",
      actions: [
        new CodeBuildAction({
          actionName: "CDK_BUILD",
          input: sourceOutput,
          outputs: [cdkBuildOutput],
          project: new PipelineProject(this, 'CdkBuildProject', {
            environment: {
              buildImage: LinuxBuildImage.STANDARD_5_0
            },
            buildSpec: BuildSpec.fromSourceFilename('build-specs/cdk-build-spec.yml')
          })
        })
      ]
    });

    pipeline.addStage({
      stageName: "Pipeline_Update",
      actions: [
        new CloudFormationCreateUpdateStackAction({
          actionName: "Pipeline_Update",
          stackName: "PipelineCourseStack",
          templatePath: cdkBuildOutput.atPath("PipelineCourseStack.template.json"),
          adminPermissions: true
        })
      ]
    })

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'PipelineCourseQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
