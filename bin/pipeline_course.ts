#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PipelineCourseStack } from '../lib/pipeline_course-stack';
import { BillingStack } from '../lib/billing-stack';

const app = new cdk.App();
new PipelineCourseStack(app, 'PipelineCourseStack', {

});

new BillingStack(app, 'BillingStack', {
  budgetAmount: 4,
  emailAddress: 'raygrant36@gmail.com'
})