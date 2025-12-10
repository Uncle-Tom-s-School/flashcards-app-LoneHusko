import {useEffect, useState} from "react";
import {makeRequest} from "@/utils/helpers.ts";
import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {cn} from "@/lib/utils.ts";

type FlashCard = {
    question: string;
    answer: string;
    points: number;
};

export const App = () => {
    const [flashCards, setFlashCards] = useState<FlashCard[]>([]);
    const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
    const [currentCard, setCurrentCard] = useState<FlashCard | null>(null);
    const [loading, setLoading] = useState(false);

    const [isFlipped, setIsFlipped] = useState(false);

    const nextCard = () => {
        const number = currentQuestionNumber + 1;
        setCurrentQuestionNumber(number);
        setCurrentCard(flashCards[number]);
        setIsFlipped(false); // always start next card on the question side
    };

    async function getCards() {
        setLoading(true);
        const r = await makeRequest({url: "/cards.json"});
        if (r.status === 200) {
            setFlashCards(r.data);
            setCurrentCard(r.data[0]);
        }
        setLoading(false);
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        getCards();
    }, []);

    const borderColor =
        currentCard && currentCard.points > 0
            ? "border-[#66CB92]"
            : currentCard && currentCard.points < 0
                ? "border-[#FF9396]"
                : "";

    return (
        <>
            <div className="w-screen h-screen flex justify-center items-center">
                {!loading && currentCard ? (
                    // Flip-card wrapper
                    <div
                        className="relative w-[520px] h-[200px] perspective-[1000px]"
                        onClick={() => setIsFlipped((prev) => !prev)}
                    >
                        {/* Inner that rotates */}
                        <div
                            className={cn(
                                "absolute inset-0 transition-transform duration-500 transform-3d cursor-pointer",
                                isFlipped ? "transform-[rotateY(180deg)]" : "transform-[rotateY(0deg)]"
                            )}
                        >
                            {/* Front (question) */}
                            <div className="absolute inset-0 backface-hidden">
                                <Card className={cn("h-full w-full", borderColor)}>
                                    <CardHeader>
                                        <CardTitle>{currentCard.question}</CardTitle>
                                        <CardDescription>Válaszolj gyorsan!</CardDescription>
                                    </CardHeader>
                                </Card>
                            </div>

                            {/* Back (answer) */}
                            <div className="absolute inset-0 transform-[rotateY(180deg)] backface-hidden">
                                <Card className={cn("h-full w-full", borderColor)}>
                                    <CardHeader>
                                        <CardTitle>{currentCard.answer}</CardTitle>
                                        <CardDescription></CardDescription>
                                    </CardHeader>
                                </Card>
                            </div>
                        </div>
                    </div>
                ) : (
                    "Loading..."
                )}
            </div>
        </>
    );
};