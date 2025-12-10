import {useEffect, useState} from "react";
import {makeRequest} from "@/utils/helpers.ts";
import {Card, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {cn} from "@/lib/utils.ts";
import {Progress} from "@/components/ui/progress.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Check, X} from "lucide-react";

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
    const [won, setWon] = useState(false);

    const [isFlipped, setIsFlipped] = useState(false);

    async function nextCard() {
        if (currentQuestionNumber === flashCards.length - 1) return setWon(
            true
        )
        setIsFlipped(false)
        setCurrentCard({...currentCard!, question: "Töltés..."})
        await new Promise(r => setTimeout(r, 500));
        const number = currentQuestionNumber + 1;
        setCurrentQuestionNumber(number);
        setCurrentCard(flashCards[number]);
    }

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
            <div className="w-screen h-screen flex justify-center items-center bg-linear-to-br from-[#f704fe] via-[#7c6fee] to-[#03d9de]">
                {!loading && currentCard && !won ? (
                    <div className="flex flex-col gap-4">
                        <Button onClick={() => window.location.reload()}>Újrakezdem</Button>
                        <div
                            className="relative w-[520px] h-[200px] perspective-[1000px]"
                            onClick={() => setIsFlipped((prev) => !prev)}
                        >
                            <div
                                className={cn(
                                    "absolute inset-0 transition-transform duration-500 transform-3d cursor-pointer",
                                    isFlipped ? "transform-[rotateY(180deg)]" : "transform-[rotateY(0deg)]"
                                )}
                            >
                                {/* Front (question) */}
                                <div className="absolute inset-0 backface-hidden">
                                    <Card className={cn("h-full w-full bg-white text-black", borderColor)}>
                                        <CardHeader>
                                            <CardTitle>{currentCard.question}</CardTitle>
                                            <CardDescription>Válaszolj gyorsan!</CardDescription>
                                        </CardHeader>
                                    </Card>
                                </div>

                                {/* Back (answer) */}
                                <div className="absolute inset-0 transform-[rotateY(180deg)] backface-hidden">
                                    <Card className={cn("h-full w-full bg-white text-black", borderColor)}>
                                        <CardHeader>
                                            <CardTitle>{currentCard.answer}</CardTitle>
                                            <CardDescription></CardDescription>
                                        </CardHeader>
                                        <CardFooter className="flex justify-evenly text-green-color">
                                            <button className="flex gap-1 outline p-2 " onClick={(e) => {
                                                e.stopPropagation();
                                                nextCard();
                                            }}>
                                                <Check/> Eltaláltam
                                            </button>
                                            <button className="flex gap-1 outline p-2 text-[#ff9396]" onClick={(e) => {
                                                e.stopPropagation();
                                                nextCard();
                                            }}>
                                                <X/> Nem sikerült
                                            </button>
                                        </CardFooter>
                                    </Card>
                                </div>
                            </div>
                        </div>
                        <div className="text-white text-center">{currentQuestionNumber + 1} / {flashCards.length}</div>
                        <Progress className="h-5" value={(currentQuestionNumber + 1 )/ flashCards.length * 100} />
                    </div>
                ) : won ? (
                    <div className="flex flex-col gap-4">
                        <Button onClick={() => window.location.reload()}>Újrakezdem</Button>
                        <div className="text-white text-center">Nyertél!</div>
                    </div>
                ) : "Töltés..."}
            </div>
        </>
    );
};