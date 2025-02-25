/**
 * Use this as a template for creating new webhooks
 *
 * Add the webhook to server.js
 * Add router to webhooks/index.js
 *
 * Webhook subscription topics can be found here [Accessed: May 19, 2021]
 * https://shopify.dev/docs/admin-api/graphql/reference/events/webhooksubscriptiontopic
 */
const {
  receiveWebhook,
  registerWebhook,
} = require("@shopify/koa-shopify-webhooks");
const webhook = receiveWebhook({ secret: process.env.SHOPIFY_API_SECRET });
const Router = require("koa-router");
const appUninstallRoute = new Router(); //Update route variable
const { ApiVersion } = require("@shopify/shopify-api");
const SessionModel = require("../models/SessionModel.js");

const webhookUrl = "/webhooks/app/uninstall";

//
//MARK:- Webhook
//

const appUninstallWebhook = async (shop, accessToken) => {
  const webhookStatus = await registerWebhook({
    address: `${process.env.SHOPIFY_APP_URL}${webhookUrl}`,
    topic: "APP_UNINSTALLED",
    accessToken,
    shop,
    apiVersion: ApiVersion.April21,
  });

  webhookStatus.success
    ? console.log(`--> Successfully registered uninstall webhook! for ${shop}`)
    : console.log(
        "--> Failed to register uninstall webhook",
        webhookStatus.result
      );
};

//
//MARK:- Route
//

appUninstallRoute.post(`${webhookUrl}`, webhook, async (ctx) => {
  const shop = ctx.state.webhook.payload.domain;
  await SessionModel.deleteMany({ shop }, (error, data) => {
    error
      ? console.log("--> An error occured: ", error.message)
      : console.log(`--> Successfully delete sessions data for ${shop}`);
  });
});

module.exports = { appUninstallWebhook, appUninstallRoute };
