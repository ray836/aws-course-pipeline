#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PipelineCourseStack } from '../lib/pipeline_course-stack';
import { BillingStack } from '../lib/billing-stack';
import { ServiceStack } from '../lib/constructs/service-stack';

const app = new cdk.App();
const pipelineStack = new PipelineCourseStack(app, 'PipelineCourseStack', {

});

const billingStack = new BillingStack(app, 'BillingStack', {
  budgetAmount: 4,
  emailAddress: 'raygrant36@gmail.com'
})

const serviceStackTest = new ServiceStack(app, 'ServiceStackTest', {
  stageName: "Test"
});
const serviceStackProd = new ServiceStack(app, "ServiceStackProd", {
  stageName: "Prod"
});

const testStage = pipelineStack.addServiceStage(serviceStackTest, "Test");
const prodStage = pipelineStack.addServiceStage(serviceStackProd, "Prod");
pipelineStack.addBillingStackToStage(billingStack, prodStage);
// There is already a VenApiEndpoint being outputted for the test stack.
// TODO: Find out how to use that.
pipelineStack.addServiceIntegrationTestToStage(testStage, serviceStackTest.serviceEndpointOutput.importValue);