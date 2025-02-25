const {
  receiveWebhook,
  registerWebhook,
} = require("@shopify/koa-shopify-webhooks");
const webhook = receiveWebhook({ secret: process.env.SHOPIFY_API_SECRET });
const Router = require("koa-router");
const subscriptionsUpdateRoute = new Router();
const { ApiVersion } = require("@shopify/shopify-api");

const webhookUrl = "/webhooks/app/subscriptions/update";

const StoreDetailsModel = require("../models/StoreDetailsModel.js");

//
//MARK:- Webhook
//

const subscriptionsUpdateWebhook = async (shop, accessToken) => {
  const webhookStatus = await registerWebhook({
    address: `${process.env.SHOPIFY_APP_URL}${webhookUrl}`,
    topic: "APP_SUBSCRIPTIONS_UPDATE",
    accessToken,
    shop,
    apiVersion: ApiVersion.April21,
  });

  webhookStatus.success
    ? console.log(
        `Successfully registered subscriptions_update webhook! for ${shop}`
      )
    : console.log(
        "Failed to register subscriptions_update webhook",
        webhookStatus.result
      );
};

//
//MARK:- Route
//

subscriptionsUpdateRoute.post(`${webhookUrl}`, webhook, async (ctx) => {
  const findSubscription = await StoreDetailsModel.find({
    subscriptionChargeId:
      ctx.request.body.app_subscription.admin_graphql_api_id,
  });

  if (findSubscription) {
    await StoreDetailsModel.findOneAndUpdate(
      {
        subscriptionChargeId:
          ctx.request.body.app_subscription.admin_graphql_api_id,
      },
      {
        updated_at: ctx.request.body.app_subscription.updated_at,
        status: ctx.request.body.app_subscription.status,
      }
    );
  } else {
    console.log("--> Subscription not found", findSubscription);
  }
});

module.exports = { subscriptionsUpdateWebhook, subscriptionsUpdateRoute };
