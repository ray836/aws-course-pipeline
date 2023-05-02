import * as cdk from 'aws-cdk-lib';
import { SecretValue } from 'aws-cdk-lib';
import { BuildSpec, LinuxBuildImage, PipelineProject } from 'aws-cdk-lib/aws-codebuild';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { CloudFormationCreateUpdateStackAction, CodeBuildAction, GitHubSourceAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import { Construct } from 'constructs';
import { ServiceStack } from '../test/constructs/service-stack';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class PipelineCourseStack extends cdk.Stack {
  private readonly pipeline: Pipeline;
  private readonly cdkBuildOutput: Artifact;
  private readonly serviceBuildOutput: Artifact;


  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.pipeline = new Pipeline(this, 'Pipeline', {
      pipelineName: 'Pipeline-From-Course',
      crossAccountKeys: false
    });

    const cdkSourceOutput = new Artifact('CDKSourceOutput');
    const serviceSourceOutput = new Artifact('ServiceSourceOutput');

    this.pipeline.addStage({
      stageName: 'Source',
      actions: [
        new GitHubSourceAction({
          owner: 'ray836',
          repo: 'aws-course-pipeline',
          branch: 'main',
          actionName: 'Pipeline_Source',
          oauthToken: SecretValue.secretsManager('github-token'),
          output: cdkSourceOutput
        }),
        new GitHubSourceAction({
          owner: 'ray836',
          repo: 'Vendash-Backend',
          branch: 'main',
          actionName: 'Vendash_Source',
          oauthToken: SecretValue.secretsManager('github-token'),
          output: serviceSourceOutput
        })
      ]
    });

    this.cdkBuildOutput = new Artifact('CdkBuildOutput');
    this.serviceBuildOutput = new Artifact('ServiceBuildOutput');

    this.pipeline.addStage({
      stageName: "Build",
      actions: [
        new CodeBuildAction({
          actionName: "CDK_BUILD",
          input: cdkSourceOutput,
          outputs: [this.cdkBuildOutput],
          project: new PipelineProject(this, 'CdkBuildProject', {
            environment: {
              buildImage: LinuxBuildImage.STANDARD_5_0
            },
            buildSpec: BuildSpec.fromSourceFilename('build-specs/cdk-build-spec.yml')
          })
        }),
        new CodeBuildAction({
          actionName: "Service_Build",
          input: serviceSourceOutput,
          outputs: [this.serviceBuildOutput],
          project: new PipelineProject(this, 'ServiceBuildProject', {
            environment: {
              buildImage: LinuxBuildImage.STANDARD_5_0
            },
            buildSpec: BuildSpec.fromSourceFilename('build-specs/cdk-build-spec.yml')
          })
        })
      ]
    });

    this.pipeline.addStage({
      stageName: "Pipeline_Update",
      actions: [
        new CloudFormationCreateUpdateStackAction({
          actionName: "Pipeline_Update",
          stackName: "PipelineCourseStack",
          templatePath: this.cdkBuildOutput.atPath("PipelineCourseStack.template.json"),
          adminPermissions: true
        })
      ]
    });
  }

  public addServiceStage(serviceStack: ServiceStack, stageName: string) {
    this.pipeline.addStage({
      stageName: stageName,
      actions: [
        new CloudFormationCreateUpdateStackAction({
          actionName: "Service_Update",
          stackName: serviceStack.stackName,
          templatePath: this.cdkBuildOutput.atPath(`${serviceStack.stackName}.template.json`),
          adminPermissions: true,
          parameterOverrides: {
            ...serviceStack.serviceCode.assign(this.serviceBuildOutput.s3Location)
          },
          extraInputs: [this.serviceBuildOutput]
        })
      ]
    })
  }


}
