import { webpush } from "./webpush";
import { prisma } from "./prisma";

export async function sendMarksUpdateNotification(message: string) {
  try {
    // Get all push subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      include: {
        student: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (subscriptions.length === 0) {
      console.log("No subscriptions found, skipping notifications");
      return;
    }

    console.log(`Sending notifications to ${subscriptions.length} subscribers`);

    // Send notification to each subscription
    const notificationPayload = JSON.stringify({
      title: "Marks Updated",
      body: message,
      url: "/student/marks"
    });

    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth
            }
          },
          notificationPayload
        );
        console.log(`Notification sent to ${subscription.student.email}`);
      } catch (error: any) {
        console.error(`Failed to send notification to ${subscription.student.email}:`, error);
        
        // If subscription is no longer valid, remove it
        if (error.statusCode === 410 || error.statusCode === 404) {
          console.log(`Removing invalid subscription for ${subscription.student.email}`);
          await prisma.pushSubscription.delete({
            where: { id: subscription.id }
          });
        }
      }
    });

    // Wait for all notifications to be sent
    await Promise.allSettled(sendPromises);
    
    console.log("Finished sending notifications");
  } catch (error) {
    console.error("Error sending bulk notifications:", error);
  }
}

export async function sendCircularNotification(title: string, content: string) {
  try {
    // Get all push subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      include: {
        student: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (subscriptions.length === 0) {
      console.log("No subscriptions found, skipping circular notifications");
      return;
    }

    console.log(`Sending circular notifications to ${subscriptions.length} subscribers`);

    // Send notification to each subscription
    const notificationPayload = JSON.stringify({
      title: `New Circular: ${title}`,
      body: content.substring(0, 100) + (content.length > 100 ? "..." : ""),
      url: "/circulars"
    });

    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth
            }
          },
          notificationPayload
        );
        console.log(`Circular notification sent to ${subscription.student.email}`);
      } catch (error: any) {
        console.error(`Failed to send circular notification to ${subscription.student.email}:`, error);
        
        // If subscription is no longer valid, remove it
        if (error.statusCode === 410 || error.statusCode === 404) {
          console.log(`Removing invalid subscription for ${subscription.student.email}`);
          await prisma.pushSubscription.delete({
            where: { id: subscription.id }
          });
        }
      }
    });

    // Wait for all notifications to be sent
    await Promise.allSettled(sendPromises);
    
    console.log("Finished sending circular notifications");
  } catch (error) {
    console.error("Error sending circular notifications:", error);
  }
}