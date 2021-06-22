import os
from slack_bolt import App

# Initializes your app with your bot token and signing secret
# app = App(
#     token=os.environ.get("SLACK_BOT_TOKEN") or "xoxb-2112480436519-2188871510309-DkhhvS0dIxEchQjJDr5Ugnoi",
#     signing_secret=os.environ.get("SLACK_SIGNING_SECRET") or "ee12d14252bfa42c58b6aa60df1afe44"
# )
app = App(
    token="xoxb-2112480436519-2188871510309-DkhhvS0dIxEchQjJDr5Ugnoi",
    signing_secret="ee12d14252bfa42c58b6aa60df1afe44"
)
# pip install slack_bolt
# export SLACK_SIGNING_SECRET=xoxb-2112480436519-2188871510309-DkhhvS0dIxEchQjJDr5Ugnoi
# export SLACK_BOT_TOKEN=ee12d14252bfa42c58b6aa60df1afe44

# Listens to incoming messages that contain "hello"
# To learn available listener arguments,
# visit https://slack.dev/bolt-python/api-docs/slack_bolt/kwargs_injection/args.html
@app.message("hello")
def message_hello(message, say):
    # say() sends a message to the channel where the event was triggered
    say(f"您好这里是你的slack机器人第一个 <@{message['user']}>!")

@app.command("/helloworld")
def repeat_text(ack, say, command):
    # Acknowledge command request
    ack()
    say(f"{command}")
# Start your app
if __name__ == "__main__":
    app.start(port=int(os.environ.get("PORT", 12000)))