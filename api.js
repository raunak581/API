
const OpenAI = require("openai");
const fs = require("fs");
const { User, Thread } = require('../API/models/assistion');

const openai = new OpenAI({
  apiKey: "sk-proj-AkmIKHdVDqbAp9gXn532T3BlbkFJNbplxEIwrrRl2dCHBqCY",
});

const ASSISTANT_ID = "asst_v723GyN0btxPD3R6usGhk6LU";

async function startOrGetThread(content, userId, userEmail) {
  try {
    let thread = await Thread.findOne({ where: { user_id: userId } });

    if (thread) {
      console.log("Existing thread found:", thread.thread_id);
      thread.thread_content += `\nUser: ${content}`;
      await thread.save();
    } else {
      console.log("No existing thread found. Creating a new thread and run.");
      const run = await openai.beta.threads.createAndRun({
        assistant_id: ASSISTANT_ID,
        thread: {
          messages: [{ role: "user", content: content }],
        },
      });

      if (!run || !run.thread_id) {
        throw new Error("Failed to create a new thread in OpenAI");
      }

      console.log("New Run Created:", run.thread_id);

      // Wait for the initial run to complete before proceeding
      await waitForRunCompletion(run.thread_id, run.id);

      thread = await Thread.create({
        thread_id: run.thread_id,
        user_id: userId,
        user_email: userEmail,
        thread_content: `User: ${content}`,
      });
    }

    return thread.thread_id;
  } catch (error) {
    console.error("Error starting or retrieving thread:", error);
    throw error;  // Re-throw to handle it where the function is called
  }
}

async function waitForRunCompletion(threadId, runId) {
  while (true) {
    const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
    if (runStatus.status === "completed") {
      console.log("Run completed:", runStatus);
      break;
    }
    console.log("Run still active, waiting...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

async function sendMessage(threadId, content) {
  try {
    const activeRuns = await openai.beta.threads.runs.list(threadId);
    const activeRun = activeRuns.data.find(run => run.status === "active");

    if (activeRun) {
      console.log("Waiting for the active run to complete...");
      await waitForRunCompletion(threadId, activeRun.id);
    }

    const message = await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: content,
    });
    console.log("User message sent:", message);

    const newRun = await openai.beta.threads.runs.create(threadId, {
      assistant_id: ASSISTANT_ID,
    });

    await waitForRunCompletion(threadId, newRun.id);
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;  // Re-throw to handle it where the function is called
  }
}

async function getAssistantResponse(threadId) {
  try {
    const threadMessages = await openai.beta.threads.messages.list(threadId);
    const assistantMessages = threadMessages.data.filter(
      (message) => message.role === "assistant"
    );

    if (assistantMessages.length > 0) {
      const latestAssistantMessage = assistantMessages[0];
      console.log("Latest Assistant Response:", latestAssistantMessage);
      return latestAssistantMessage.content;
    } else {
      console.log("No assistant response found.");
      return null;
    }
  } catch (error) {
    console.error("Error retrieving assistant response:", error);
    throw error;  // Re-throw to handle it where the function is called
  }
}

async function chatWithAssistant(content, userId, userEmail) {
  try {
    const threadId = await startOrGetThread(content, userId, userEmail);

    await sendMessage(threadId, content);

    const response = await getAssistantResponse(threadId);
    console.log("Assistant's Response:", response);

    if (response) {
      const thread = await Thread.findOne({ where: { thread_id: threadId } });
      if (thread) {
        thread.thread_content += `\nAssistant: ${response[0].text.value}`;
        await thread.save();
      }
      return response[0].text.value;
    } else {
      console.error("Failed to get a valid response from the assistant.");
      return null;
    }
  } catch (error) {
    console.error("Error in chatWithAssistant:", error);
    return null;
  }
}

module.exports = { chatWithAssistant };

