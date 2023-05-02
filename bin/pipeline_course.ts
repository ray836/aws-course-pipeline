#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PipelineCourseStack } from '../lib/pipeline_course-stack';
import { BillingStack } from '../lib/billing-stack';
import { ServiceStack } from '../test/constructs/service-stack';

const app = new cdk.App();
const pipelineStack = new PipelineCourseStack(app, 'PipelineCourseStack', {

});

new BillingStack(app, 'BillingStack', {
  budgetAmount: 4,
  emailAddress: 'raygrant36@gmail.com'
})

const serviceStackProd = new ServiceStack(app, "ServiceStackProd");

pipelineStack.addServiceStage(serviceStackProd, "Prod");