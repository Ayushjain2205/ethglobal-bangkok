"use client";
import React, { useState, useRef, useEffect } from "react";
import Layout from "@/components/Layout";
import Confetti from "react-confetti";
import { supabase } from "@/lib/supabase";

const CustomRange = ({
  value,
  onChange,
  min = 0,
  max = 100,
  label,
  leftLabel,
  rightLabel,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const rangeRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    handleMouseMove(e);
  };

  const handleMouseMove = (e) => {
    if (isDragging || e.type === "click") {
      const rect = rangeRef.current.getBoundingClientRect();
      const x = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
      const percent = x / rect.width;
      const newValue = Math.round(percent * (max - min) + min);
      onChange(newValue);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="mb-6">
      <label className="block mb-2">{label}</label>
      <div
        className="relative cursor-pointer"
        ref={rangeRef}
        onMouseDown={handleMouseDown}
        onClick={handleMouseMove}
      >
        <progress className="nes-progress is-primary" value={value} max={max} />
        <div
          className="absolute top-0 w-4 h-full bg-black border-2 border-white"
          style={{
            left: `calc(${((value - min) / (max - min)) * 100}% - 8px)`,
          }}
        />
      </div>
      <div className="flex justify-between text-xs mt-1">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
};

const NPCCreator = () => {
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [creationProgress, setCreationProgress] = useState(0);
  const [creationComplete, setCreationComplete] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [npcData, setNpcData] = useState({
    basicInfo: {
      name: "",
      background: "",
      appearance: "",
    },
    personality: {
      riskTolerance: 50,
      rationality: 50,
      autonomy: 50,
    },
    selectedValues: [],
    selectedAims: [],
    voice: {
      type: "",
      sample: null,
    },
  });
  const [avatarKey, setAvatarKey] = useState(0);
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    wallet_address: "",
    wallet_id: "",
    transaction_hash: "",
    network: "base-sepolia",
    balance: "0",
    status: "pending",
  });

  const predefinedValues = [
    { id: "analytical", label: "Analytical", icon: "🔍" },
    { id: "creative", label: "Creative", icon: "🎨" },
    { id: "cautious", label: "Cautious", icon: "🛡️" },
    { id: "aggressive", label: "Aggressive", icon: "⚡" },
    { id: "cooperative", label: "Cooperative", icon: "🤝" },
    { id: "competitive", label: "Competitive", icon: "🏆" },
  ];

  const predefinedAims = [
    { id: "profit", label: "Profit Maximization", icon: "💰" },
    { id: "impact", label: "Social Impact", icon: "🌍" },
    { id: "innovation", label: "Innovation", icon: "💡" },
    { id: "stability", label: "Stability", icon: "⚖️" },
    { id: "growth", label: "Growth", icon: "📈" },
    { id: "community", label: "Community Building", icon: "👥" },
  ];

  const handleInputChange = (e, section) => {
    const { name, value } = e.target;
    setNpcData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value,
      },
    }));
  };

  const handleSliderChange = (value, trait) => {
    setNpcData((prev) => ({
      ...prev,
      personality: {
        ...prev.personality,
        [trait]: value,
      },
    }));
  };

  const toggleSelection = (item, type) => {
    setNpcData((prev) => {
      const key = type === "values" ? "selectedValues" : "selectedAims";
      const updatedSelection = prev[key].includes(item.id)
        ? prev[key].filter((id) => id !== item.id)
        : [...prev[key], item.id];
      return { ...prev, [key]: updatedSelection };
    });
  };

  const autoPopulate = (field) => {
    const populatedData = {
      background:
        "A mysterious figure with a hidden past, this NPC grew up in the shadowy alleys of a bustling cyberpunk metropolis. Their life changed when they discovered their innate ability to manipulate digital realities.",
      appearance:
        "Tall and lithe, with neon-blue hair and silver cybernetic eyes. Wears a sleek, black exosuit adorned with glowing circuit patterns. A holographic interface flickers around their left arm.",
    };
    setNpcData((prev) => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        [field]: populatedData[field],
      },
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNpcData((prev) => ({
        ...prev,
        voice: {
          ...prev.voice,
          sample: file,
        },
      }));
    }
  };

  const handleSubmit = async () => {
    setIsCreating(true);

    try {
      const npcConfig = {
        name: npcData.basicInfo.name,
        background: npcData.basicInfo.background,
        appearance: npcData.basicInfo.appearance,
        personality: {
          riskTolerance: npcData.personality.riskTolerance,
          rationality: npcData.personality.rationality,
          autonomy: npcData.personality.autonomy,
        },
        core_values: npcData.selectedValues,
        primary_aims: npcData.selectedAims,
        voice: {
          type: npcData.voice.type,
          sample: npcData.voice.sample ? npcData.voice.sample.name : null,
        },
      };

      const response = await fetch("http://localhost:8000/npc-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(npcConfig),
      });

      if (!response.ok) {
        throw new Error("Failed to create NPC");
      }

      const { wallet, npc } = await response.json();
      setWalletInfo(wallet);
      setCreationComplete(true);
      setShowConfetti(true);
    } catch (error) {
      console.error("Error creating NPC:", error);
      alert("Failed to create NPC. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="nes-container with-title">
            <p className="title">Basic Information</p>
            <div className="flex justify-center mb-6">
              <div
                className="nes-avatar is-large is-rounded"
                style={{ width: "100px", height: "100px" }}
              >
                <img
                  key={avatarKey}
                  src={`https://api.cloudnouns.com/v1/pfp?timestamp=${avatarKey}`}
                  alt="NPC Avatar"
                  className="rounded-full h-[100px] w-[100px]"
                />
              </div>
            </div>
            <div className="nes-field mb-6">
              <label htmlFor="name">NPC Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="nes-input"
                value={npcData.basicInfo.name}
                onChange={(e) => handleInputChange(e, "basicInfo")}
              />
            </div>
            <div className="nes-field mb-6">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="background">Background Story</label>
                <button
                  className="nes-btn is-primary is-small"
                  onClick={() => autoPopulate("background")}
                >
                  🔮
                </button>
              </div>
              <textarea
                id="background"
                name="background"
                className="nes-textarea"
                value={npcData.basicInfo.background}
                onChange={(e) => handleInputChange(e, "basicInfo")}
              ></textarea>
            </div>
            <div className="nes-field mb-6">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="appearance">Appearance Description</label>
                <button
                  className="nes-btn is-primary is-small"
                  onClick={() => autoPopulate("appearance")}
                >
                  🔮
                </button>
              </div>
              <textarea
                id="appearance"
                name="appearance"
                className="nes-textarea"
                value={npcData.basicInfo.appearance}
                onChange={(e) => handleInputChange(e, "basicInfo")}
              ></textarea>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="nes-container with-title">
            <p className="title">Personality Traits</p>
            <CustomRange
              value={npcData.personality.riskTolerance}
              onChange={(value) => handleSliderChange(value, "riskTolerance")}
              label="Risk Tolerance"
              leftLabel="Conservative"
              rightLabel="Risk-Taker"
            />
            <CustomRange
              value={npcData.personality.rationality}
              onChange={(value) => handleSliderChange(value, "rationality")}
              label="Decision Making"
              leftLabel="Emotional"
              rightLabel="Rational"
            />
            <CustomRange
              value={npcData.personality.autonomy}
              onChange={(value) => handleSliderChange(value, "autonomy")}
              label="Autonomy Level"
              leftLabel="Guided"
              rightLabel="Independent"
            />
          </div>
        );
      case 3:
        return (
          <div className="nes-container with-title">
            <p className="title">Core Values</p>
            <div className="grid grid-cols-2 gap-4">
              {predefinedValues.map((value) => (
                <button
                  key={value.id}
                  className={`nes-btn ${
                    npcData.selectedValues.includes(value.id)
                      ? "is-primary"
                      : ""
                  }`}
                  onClick={() => toggleSelection(value, "values")}
                >
                  {value.icon} {value.label}
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="nes-container with-title">
            <p className="title">Primary Aims</p>
            <div className="grid grid-cols-2 gap-4">
              {predefinedAims.map((aim) => (
                <button
                  key={aim.id}
                  className={`nes-btn ${
                    npcData.selectedAims.includes(aim.id) ? "is-primary" : ""
                  }`}
                  onClick={() => toggleSelection(aim, "aims")}
                >
                  {aim.icon} {aim.label}
                </button>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="nes-container with-title">
            <p className="title">Voice Settings</p>
            <div className="nes-field mb-6">
              <label htmlFor="voiceType">Voice Type</label>
              <div className="nes-select">
                <select
                  id="voiceType"
                  name="type"
                  value={npcData.voice.type}
                  onChange={(e) => handleInputChange(e, "voice")}
                >
                  <option value="">Select Voice Type</option>
                  <option value="friendly">Friendly</option>
                  <option value="professional">Professional</option>
                  <option value="authoritative">Authoritative</option>
                  <option value="casual">Casual</option>
                </select>
              </div>
            </div>
            <div className="nes-field mb-6">
              <label htmlFor="voiceSample">Upload Voice Sample</label>
              <div className="nes-btn">
                <label>
                  Choose file
                  <input
                    type="file"
                    id="voiceSample"
                    accept="audio/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
              {npcData.voice.sample && (
                <p className="mt-2">
                  File selected: {npcData.voice.sample.name}
                </p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderSummary = () => (
    <div className="nes-container with-title">
      <p className="title">NPC Summary</p>
      <div className="mb-4">
        <h3 className="nes-text is-primary">Basic Information</h3>
        <p>Name: {npcData.basicInfo.name}</p>
        <p>Background: {npcData.basicInfo.background.substring(0, 60)}...</p>
        <p>Appearance: {npcData.basicInfo.appearance.substring(0, 60)}...</p>
      </div>
      <div className="mb-4">
        <h3 className="nes-text is-primary">Personality Traits</h3>
        <p>Risk Tolerance: {npcData.personality.riskTolerance}</p>
        <p>Decision Making: {npcData.personality.rationality}</p>
        <p>Autonomy Level: {npcData.personality.autonomy}</p>
      </div>
      <div className="mb-4">
        <h3 className="nes-text is-primary">Core Values</h3>
        <p>{npcData.selectedValues.join(", ")}</p>
      </div>
      <div className="mb-4">
        <h3 className="nes-text is-primary">Primary Aims</h3>
        <p>{npcData.selectedAims.join(", ")}</p>
      </div>
      <div className="mb-4">
        <h3 className="nes-text is-primary">Voice Settings</h3>
        <p>Type: {npcData.voice.type}</p>
        <p>
          Sample:{" "}
          {npcData.voice.sample ? npcData.voice.sample.name : "Not provided"}
        </p>
      </div>
    </div>
  );

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const renderCreationStatus = () => (
    <div className="nes-container">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="nes-text is-primary">Creating your NPC...</div>
        <progress
          className="nes-progress is-pattern"
          value={creationProgress}
          max="100"
        ></progress>
      </div>
    </div>
  );

  const renderWalletInfo = () => (
    <div className="nes-container with-title">
      <p className="title">NPC Created Successfully!</p>
      <div className="mb-4">
        <p className="mb-2">Wallet Address: {walletInfo.wallet_address}</p>
        <p>Transaction Hash: {walletInfo.transaction_hash || "Pending..."}</p>
      </div>
      {walletInfo.transaction_hash && (
        <button
          className="nes-btn is-primary"
          onClick={() =>
            window.open(
              `https://base-sepolia.blockscout.com/tx/${walletInfo.transaction_hash}`,
              "_blank"
            )
          }
        >
          View on Block Explorer
        </button>
      )}
    </div>
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setAvatarKey((prev) => prev + 1);
    }, 2000); // Change image every 2 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isCreating) {
      interval = setInterval(() => {
        setCreationProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 50); // Adjust speed by changing this value
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isCreating]);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="nes-text is-primary text-center">Create Your NPC</h1>
        {!isCreating && !creationComplete && (
          <>
            {renderStep()}
            <div className="flex justify-between">
              {step > 1 && (
                <button className="nes-btn" onClick={handlePrev}>
                  Previous
                </button>
              )}
              {step < 5 ? (
                <button className="nes-btn is-primary" onClick={handleNext}>
                  Next
                </button>
              ) : (
                <button className="nes-btn is-success" onClick={handleSubmit}>
                  Create NPC
                </button>
              )}
            </div>
          </>
        )}
        {(isCreating || creationComplete) && (
          <>
            {renderSummary()}
            {isCreating && renderCreationStatus()}
            {creationComplete && renderWalletInfo()}
          </>
        )}
        {showConfetti && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={200}
            gravity={0.1}
          />
        )}
      </div>
    </Layout>
  );
};

export default NPCCreator;
