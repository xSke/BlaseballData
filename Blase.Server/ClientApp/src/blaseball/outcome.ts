import {GamePayload} from "./update";

interface Outcome {
    name: string;
    emoji: string;
    text: string;
}

interface OutcomeType {
    name: string;
    emoji: string;
    search: RegExp[];
}

export const outcomeTypes: OutcomeType[] = [
    {name: "Reverb", emoji: "\u{1F30A}", search: [/reverb/gi]},
    {name: "Feedback", emoji: "\u{1F3A4}", search: [/feedback/gi]},
    {name: "Incineration", emoji: "\u{1F525}", search: [/rogue umpire/gi]},
    {name: "Peanut", emoji: "\u{1F95C}", search: [/peanut/gi]},
]

export function getOutcomes(evt: GamePayload): Outcome[] {
    const foundOutcomes = [];
    for (const outcomeText of evt.outcomes) {
        for (const outcomeType of outcomeTypes) {
            let found = false;
            for (const outcomeSearch of outcomeType.search) {
                // Use a flag since multiple matching searchs shouldn't duplicate
                if (outcomeSearch.test(outcomeText))
                    found = true;
            }

            if (found) {
                const outcome = {
                    ...outcomeType,
                    text: outcomeText
                };
                foundOutcomes.push(outcome);
            }
        }
    }

    return foundOutcomes;
}