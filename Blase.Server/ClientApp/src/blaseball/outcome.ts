import {GamePayload} from "./update";

interface Outcome {
    name: string;
    emoji: string;
    text: string;
    color: string;
}

interface OutcomeType {
    name: string;
    emoji: string;
    search: RegExp[];
    color: string;
}

export const outcomeTypes: OutcomeType[] = [
    {name: "Reverb", emoji: "\u{1F30A}", search: [/reverb/i], color: "blue"},
    {name: "Feedback", emoji: "\u{1F3A4}", search: [/feedback/i], color: "pink"},
    {name: "Incineration", emoji: "\u{1F525}", search: [/rogue umpire/i], color: "orange"},
    {name: "Peanut", emoji: "\u{1F95C}", search: [/peanut/i], color: "orange"},
    {name: "Blooddrain", emoji: "\u{1FA78}", search: [/blooddrain/i], color: "purple"},
    {name: "Unstable", emoji: "\u{1F525}", search: [/Unstable/i], color: "blue"}
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