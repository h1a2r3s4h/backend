import { Webhook } from 'svix';
import Stripe from 'stripe';
import User from '../models/User.js';
import Purchase  from '../models/purchase.js';
import Course from '../models/Course.js';

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const clerkWebhook = async (req, res) => {
  try {
    const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    await webhook.verify(JSON.stringify(req.body), {
      'svix-id': req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature'],
    });

    const { data, type } = req.body;

    switch (type) {
      case 'user.created':
        await User.create({
          _id: data.id,
          email: data.email_addresses[0]?.email_address,
          name: `${data.first_name} ${data.last_name}`,
          imageUrl: data.image_url,
        });
        break;

      default:
        break;
    }

    res.status(200).json({ message: 'Webhook received' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
};


export const stripeWebhooks = async (request, response) => {
    try {
        const sig = request.headers['stripe-signature'];
        const event = Stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

        switch (event.type) {
            case 'payment_intent.succeeded': {
                const session = await stripeInstance.checkout.sessions.list({ payment_intent: event.data.object.id });
                const { purchaseId } = session.data[0].metadata;
                const purchase = await Purchase.findById(purchaseId);
                const user = await User.findById(purchase.userId);
                const course = await Course.findById(purchase.courseId.toString());

                course.enrolledStudents.push(user._id);
                await course.save();

                user.enrolledCourses.push(course._id);
                await user.save();

                purchase.status = 'completed';
                await purchase.save();
                break;
            }
            case 'payment_intent.payment_failed': {
                const session = await stripeInstance.checkout.sessions.list({ payment_intent: event.data.object.id });
                const { purchaseId } = session.data[0].metadata;
                const purchase = await Purchase.findById(purchaseId);
                purchase.status = 'failed';
                await purchase.save();
                break;
            }
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        response.json({ received: true });
    } catch (error) {
        response.status(400).send(`Webhook Error: ${error.message}`);
    }
};
