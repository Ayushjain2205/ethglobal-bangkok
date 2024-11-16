"use client";

import React, { useState, useRef, useEffect } from "react";
import Layout from "@/components/Layout";

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
    <div className="mb-4">
      <label className="block mb-2">{label}</label>
      <div
        className=" relative cursor-pointer"
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
      pitch: 50,
      speed: 50,
    },
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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="nes-container with-title">
            <p className="title">Basic Information</p>
            <div className="nes-field">
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
            <div className="nes-field">
              <label htmlFor="background">Background Story</label>
              <textarea
                id="background"
                name="background"
                className="nes-textarea"
                value={npcData.basicInfo.background}
                onChange={(e) => handleInputChange(e, "basicInfo")}
              ></textarea>
            </div>
            <div className="nes-field">
              <label htmlFor="appearance">Appearance Description</label>
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
            <p className="title">Core Values & Primary Aims</p>
            <div className="mb-4">
              <p>Core Values</p>
              <div className="grid grid-cols-2 gap-2">
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
            <div>
              <p>Primary Aims</p>
              <div className="grid grid-cols-2 gap-2">
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
          </div>
        );
      case 4:
        return (
          <div className="nes-container with-title">
            <p className="title">Voice Settings</p>
            <div className="nes-select">
              <select
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
            <CustomRange
              value={npcData.voice.pitch}
              onChange={(value) =>
                handleInputChange({ target: { name: "pitch", value } }, "voice")
              }
              label="Pitch"
              leftLabel="Low"
              rightLabel="High"
            />
            <CustomRange
              value={npcData.voice.speed}
              onChange={(value) =>
                handleInputChange({ target: { name: "speed", value } }, "voice")
              }
              label="Speed"
              leftLabel="Slow"
              rightLabel="Fast"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    console.log("NPC Data:", npcData);
    // Here you would typically send the data to your backend
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="nes-text is-primary text-center">Create Your NPC</h1>
        {renderStep()}
        <div className="flex justify-between">
          {step > 1 && (
            <button className="nes-btn" onClick={handlePrev}>
              Previous
            </button>
          )}
          {step < 4 ? (
            <button className="nes-btn is-primary" onClick={handleNext}>
              Next
            </button>
          ) : (
            <button className="nes-btn is-success" onClick={handleSubmit}>
              Create NPC
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NPCCreator;
