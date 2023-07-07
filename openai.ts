import { OpenAI } from "https://deno.land/x/openai@1.4.0/mod.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

const openAI = new OpenAI(OPENAI_API_KEY);

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
