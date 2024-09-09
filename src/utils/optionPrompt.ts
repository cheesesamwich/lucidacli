import PromptSync from "prompt-sync";

export function optionPrompt(message: string, options: string[] = ["y", "n"]) {
    while (true) {
        const input = PromptSync()(message);
        const selectedOption = options.find(e => e.toLowerCase() === input.toLowerCase());

        if (selectedOption) {
            return selectedOption;
        } else {
            console.log("Invalid choice! Please try again.");
        }
    }
}

