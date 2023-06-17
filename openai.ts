import { OpenAI } from "https://deno.land/x/openai@1.4.0/mod.ts";

const OPEN_AI_KEY = Deno.env.get("OPEN_AI_KEY")!;

const openAI = new OpenAI(OPEN_AI_KEY);

export interface Message {
    name?: string;
    role: "system" | "assistant" | "user";
    content: string;
}

export const chat = async (messages: Message[]): Promise<string> => {
    const chatCompletion = await openAI.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages.map((message) => ({
            "role": message.role,
            "content": message.content,
        })),
    });
    //   console.log(chatCompletion);
    return chatCompletion.choices[0].message.content;
};
