import "./utils/env";
import { App, LogLevel, subtype, BotMessageEvent, UsersSelectAction, BlockAction } from '@slack/bolt';
import {
  isGenericMessageEvent,
  isMessageItem
} from './utils/helpers'

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.INFO
});

// This will match any message that contains 👋
app.error(async (e) => {
  console.log(e)
});

app.command('/helloworld', async (everything: any) => {    //Ignore the :any if you're not using Typescript
  everything.ack();

  console.log(JSON.stringify(everything));    //A good way to see what variables you have to play with
});

// // Listen for a slash command invocation
// app.command('/helloworld', async ({ ack, payload, context }) => {
//   console.log("helloworld");
  
//   // Acknowledge the command request
//   await ack();

//   try {
//     const result = await app.client.chat.postMessage({
//       token: context.botToken,
//       // Channel to send message to
//       channel: payload.channel_id,
//       // Include a button in the message (or whatever blocks you want!)
//       blocks: [
//         {
//           type: 'section',
//           text: {
//             type: 'mrkdwn',
//             text: 'Go ahead. Click it.'
//           },
//           accessory: {
//             type: 'button',
//             text: {
//               type: 'plain_text',
//               text: 'Click me!'
//             },
//             action_id: 'button_abc'
//           }
//         }
//       ],
//       // Text in the notification
//       text: 'Message from Test App'
//     });
//     console.log(result);
//   }
//   catch (error) {
//     console.error(error);
//   }
// });

// // Listen for a button invocation with action_id `button_abc`
// // You must set up a Request URL under Interactive Components on your app configuration page
// app.action('button_abc', async ({ ack, body, context }) => {
//   // Acknowledge the button request
//   ack();

//   try {
//     // Update the message
//     const result = await app.client.chat.update({
//       token: context.botToken,
//       // ts of message to update
//       ts: body.message.ts,
//       // Channel of message
//       channel: body.channel.id,
//       blocks: [
//         {
//           type: 'section',
//           text: {
//             type: 'mrkdwn',
//             text: '*The button was clicked!*'
//           }
//         }
//       ],
//       text: 'Message from Test App'
//     });
//     console.log(result);
//   }
//   catch (error) {
//     console.error(error);
//   }
// });
app.event('app_home_opened', async ({ event, client, context }) => {
  try {
    /* view.publish is the method that your app uses to push a view to the Home tab */
    const result = await client.views.publish({

      /* the user that opened your app's app home */
      user_id: event.user,

      /* the view object that appears in the app home*/
      view: {
        type: 'home',
        callback_id: 'home_view',

        /* body of the view */
        blocks: [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Welcome to your _App's Home_* :tada:"
            }
          },
          {
            "type": "divider"
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "This button won't do much for now but you can set up a listener for it using the `actions()` method and passing its unique `action_id`. See an example in the `examples` folder within your Bolt app."
            }
          },
          {
            "type": "actions",
            "elements": [
              {
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "text": "Click me!"
                }
              }
            ]
          }
        ]
      }
    });
  }
  catch (error) {
    console.error(error);
  }
});
// Reverse all messages the app can hear
app.message(async ({ message, say }) => {
  await say("goold");
});

/**
 * Listening to messages
 */
// This will match any message that contains 👋
app.message(':wave:', async ({ message, say }) => {
  if (!isGenericMessageEvent(message)) return;

  await say(`Hello, <@${message.user}>`);
});
app.message('hello', async ({ message, say }) => {
  await say(`Hello, <@${message}>`);
});
/**
 * Sending messages
 */
// Listens for messages containing "knock knock" and responds with an italicized "who's there?"
app.message('knock knock', async ({ say }) => {
  await say(`_Who's there?_`);
});

// Sends a section block with datepicker when someone reacts with a 📅 emoji
app.event('reaction_added', async ({ event, client }) => {
  // Could be a file that was reacted upon
  if (event.reaction === 'calendar' && isMessageItem(event.item)) {
    await client.chat.postMessage({
      text: 'Pick a reminder date',
      channel: event.item.channel,
      blocks: [{
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Pick a date for me to remind you'
        },
        accessory: {
          type: 'datepicker',
          action_id: 'datepicker_remind',
          initial_date: '2019-04-28',
          placeholder: {
            type: 'plain_text',
            text: 'Select a date'
          }
        }
      }]
    });
  }
});

/**
 * Listening to events
 */
const welcomeChannelId = 'C12345';

// When a user joins the team, send a message in a predefined channel asking them to introduce themselves
app.event('team_join', async ({ event, client }) => {
  try {
    // Call chat.postMessage with the built-in client
    const result = await client.chat.postMessage({
      channel: welcomeChannelId,
      text: `Welcome to the team, <@${event.user}>! 🎉 You can introduce yourself in this channel.`
    });
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});

app.message(subtype('bot_message'), async ({ message }) => {
  console.log(`The bot user ${(message as BotMessageEvent).user} said ${(message as BotMessageEvent).text}`);
});

/**
 * Using the Web API
 */
// Unix Epoch time for September 30, 2019 11:59:59 PM
const whenSeptemberEnds = '1569887999';

app.message('wake me up', async ({ message, client }) => {
  try {
    // Call chat.scheduleMessage with the built-in client
    const result = await client.chat.scheduleMessage({
      channel: message.channel,
      post_at: whenSeptemberEnds,
      text: 'Summer has come and passed'
    });
  }
  catch (error) {
    console.error(error);
  }
});

/**
 * Listening to actions
 */
// Your listener function will be called every time an interactive component with the action_id "approve_button" is triggered
app.action('approve_button', async ({ ack }) => {
  await ack();
  // Update the message to reflect the action
});

// Your listener function will only be called when the action_id matches 'select_user' AND the block_id matches 'assign_ticket'
app.action({ action_id: 'select_user', block_id: 'assign_ticket' },
  async ({ body, client, ack }) => {
    await ack();
    // TODO
    body = body as BlockAction;
    try {
      // Make sure the event is not in a view
      if (body.message) {
        await client.reactions.add({
          name: 'white_check_mark',
          timestamp: body.message?.ts,
          channel: body.channel?.id
        });
      }
    }
    catch (error) {
      console.error(error);
    }
  });

// Your middleware will be called every time an interactive component with the action_id “approve_button” is triggered
app.action('approve_button', async ({ ack, say }) => {
  // Acknowledge action request
  await ack();
  await say('Request approved 👍');
});

(async () => {
  // Start your app
  await app.start(Number(process.env.PORT) || 12000);

  console.log('⚡️ Bolt app is running!');
})();

