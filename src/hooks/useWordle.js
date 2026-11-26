
import { useState, useEffect, useCallback } from "react";
import { getRandomWord } from "../utils/words";
import {
  isValidWord,
  checkGuess,
  getLetterStatuses
} from "../utils/gameLogic";

function useWordle() {
  const [solutionWord, setSolutionWord] = useState(() => getRandomWord());
  const [currentGuess, setCurrentGuess] = useState("");
  const [pastGuesses, setPastGuesses] = useState([]);
  const [gameStatus, setGameStatus] = useState("IN_PROGRESS");
  const [message, setMessage] = useState("");

  const letterStatuses = getLetterStatuses(pastGuesses);

  const handleKeyPress = useCallback((key) => {
    if (gameStatus !== "IN_PROGRESS") return;

    if (key === "ENTER") {
      if (currentGuess.length !== 5) {
        setMessage("Word must be 5 letters");
        return;
      }

      if (!isValidWord(currentGuess)) {
        setMessage("Word not in dictionary");
        return;
      }

      const result = checkGuess(currentGuess, solutionWord);

      const newGuess = {
        guess: currentGuess,
        result
      };

      const newPastGuesses = [...pastGuesses, newGuess];

      setPastGuesses(newPastGuesses);
      setCurrentGuess("");
      setMessage("");

      if (currentGuess === solutionWord) {
        setGameStatus("WON");
        setMessage("Congratulations! You won!");
      } else if (newPastGuesses.length === 6) {
        setGameStatus("LOST");
        setMessage(`Game over! The word was ${solutionWord}`);
      }

      return;
    }

    if (key === "BACKSPACE") {
      setCurrentGuess((previous) => previous.slice(0, -1));
      setMessage("");
      return;
    }

    if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
      setCurrentGuess((previous) => previous + key);
      setMessage("");
    }
  }, [solutionWord, currentGuess, pastGuesses, gameStatus]);

  const resetGame = () => {
    setSolutionWord(getRandomWord());
    setCurrentGuess("");
    setPastGuesses([]);
    setGameStatus("IN_PROGRESS");
    setMessage("");
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        handleKeyPress("ENTER");
      } else if (event.key === "Backspace") {
        handleKeyPress("BACKSPACE");
      } else if (/^[a-zA-Z]$/.test(event.key)) {
        handleKeyPress(event.key.toUpperCase());
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyPress]);

  return {
    solutionWord,
    currentGuess,
    pastGuesses,
    gameStatus,
    message,
    letterStatuses,
    handleKeyPress,
    resetGame
  };
}

export default useWordle;
