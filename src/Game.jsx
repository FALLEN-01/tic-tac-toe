import React from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function Game() {
  const navigate = useNavigate();
  const { gameId } = useParams(); // if you’re using dynamic routes like /game/:gameId

  // Define the decorative X and O elements data
  const decorativeElements = [
    { type: "X", position: "top-[61px] left-3", opacity: "opacity-10" },
    { type: "O", position: "top-[232px] left-[1130px]", opacity: "opacity-10" },
    { type: "X", position: "top-[820px] left-[1157px]", opacity: "opacity-10" },
    { type: "O", position: "top-[648px] left-[204px]", opacity: "opacity-10" },
  ];

  const handlePlayClick = () => {
    // Navigate to result page after game completion
    navigate(`/result/${gameId}`);
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="w-[1440px] h-[1024px] relative bg-[linear-gradient(135deg,rgba(102,126,234,1)_0%,rgba(118,75,162,1)_100%)] border-0">
        <div className="p-0">
          {/* Main title */}
          <div className="absolute w-[1244px] h-[334px] top-28 left-[157px]">
            <h1 className="absolute w-[1187px] top-0 left-0 opacity-90 font-normal text-white text-[80px] text-center tracking-[0] leading-normal">
              WELCOME TO TWIST TAC TOE
            </h1>
          </div>

          {/* Decorative X and O elements */}
          {decorativeElements.map((element, index) => (
            <div
              key={`element-${index}`}
              className={`absolute w-[114px] ${element.position} ${element.opacity} font-normal text-white text-[80px] text-center tracking-[0] leading-normal`}
            >
              {element.type}
            </div>
          ))}

          {/* Play button */}
          <button
            onClick={handlePlayClick}
            aria-label="Play game"
            className="absolute w-[121px] h-48 top-[472px] left-[736px] focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-transform hover:scale-110"
          >
            <img
              className="w-full h-full"
              alt="Play button"
              src="/figmaAssets/polygon-1.svg"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
