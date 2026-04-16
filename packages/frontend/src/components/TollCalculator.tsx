"use client";

import {
  Button,
  Control,
  Field,
  Input,
  Select,
  Title,
} from "@allxsmith/bestax-bulma";
import { useState } from "react";

interface DailyTollResponse {
  date: string;
  totalFeeDkk: number;
  chargedPassages?: {
    windowStart: string;
    windowEnd: string;
    appliedFeeDkk: number;
    triggeringTimestamp: string;
  }[];
  notes?: string[];
}

const vehicleTypes = [
  "car",
  "motorbike",
  "emergency",
  "tractor",
  "diplomat",
  "military",
  "foreign",
  "bus",
];

export default function TollCalculator() {
  const [vehicleType, setVehicleType] = useState("");
  const [passageList, setPassageList] = useState<string[]>([]);
  const [date, setDate] = useState("2013-02-07");
  const [time, setTime] = useState("06:15");
  const [timezone, setTimezone] = useState("+01:00");
  const [result, setResult] = useState<DailyTollResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const addPassage = () => {
    if (!date || !time) {
      setError("Date and time are required");
      return;
    }
    const timestamp = `${date}T${time}:00${timezone}`;
    setPassageList([...passageList, timestamp]);
    setError("");
  };

  const removePassage = (index: number) => {
    setPassageList(passageList.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!vehicleType) {
      setError("Please select a vehicle type");
      return;
    }

    if (passageList.length === 0) {
      setError("Please add at least one passage");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:4000/api/passages/daily-toll",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vehicleType,
            passages: passageList.map((ts) => ({ timestamp: ts })),
          }),
        },
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to calculate");
      }

      const data: DailyTollResponse = await response.json();
      setResult(data);
      console.log("API Response:", data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      console.log("Calculation completed");
      console.log("Vehicle Type:", vehicleType);
      console.log("Passages:", passageList);
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        maxWidth: "700px",
      }}
    >
      <div>
        <Title size="2">Toll Fee Calculator</Title>
        <form>
          <Field label="Vehicle Type">
            <Control>
              <Select
                value={vehicleType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setVehicleType(e.target.value)
                }
              >
                <option value="">Select vehicle type</option>
                {vehicleTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </Control>
          </Field>
          <Title size="5">Add Passages</Title>
          {/* Date */}
          <Field label="Date">
            <Control>
              <Input
                type="date"
                value={date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDate(e.target.value)
                }
              />
            </Control>
          </Field>
          {/* Time */}
          <Field label="Time">
            <Control>
              <Input
                type="time"
                value={time}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTime(e.target.value)
                }
              />
            </Control>
          </Field>
          {/* Timezone */}
          <Field label="Timezone">
            <Control>
              <Select
                value={timezone}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setTimezone(e.target.value)
                }
              >
                <option value="+01:00">+01:00</option>
                <option value="+02:00">+02:00</option>
                <option value="Z">UTC (Z)</option>
              </Select>
            </Control>
          </Field>
          <Button
            type="button"
            onClick={addPassage}
            style={{ padding: "0.5rem 1rem" }}
            className="button"
          >
            Add
          </Button>
          {error && (
            <p style={{ color: "red", marginTop: "0.5rem" }}>Error: {error}</p>
          )}
        </form>
      </div>

      {passageList.length > 0 && (
        <div>
          <h3>Passages ({passageList.length})</h3>
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              fontSize: "0.9rem",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    border: "1px solid #ccc",
                    padding: "0.5rem",
                    textAlign: "left",
                  }}
                >
                  Timestamp
                </th>
                <th
                  style={{
                    border: "1px solid #ccc",
                    padding: "0.5rem",
                    width: "80px",
                  }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {passageList.map((ts, i) => (
                <tr key={i}>
                  <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                    {ts}
                  </td>
                  <td
                    style={{
                      border: "1px solid #ccc",
                      padding: "0.5rem",
                      textAlign: "center",
                    }}
                  >
                    <Button
                      type="button"
                      onClick={() => removePassage(i)}
                      style={{ padding: "0.25rem 0.75rem", color: "red" }}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={loading || passageList.length === 0}
        className="button"
        style={{
          padding: "0.75rem",
          fontSize: "1rem",
          cursor: passageList.length === 0 ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Calculating..." : "Calculate Total Fee"}
      </Button>

      {result && (
        <div
          style={{
            backgroundColor: "#000",
            padding: "1rem",
            borderRadius: "4px",
          }}
        >
          <h3>Result</h3>
          <p>
            <strong>Date:</strong> {result.date}
          </p>
          <p>
            <strong>Total Fee:</strong>{" "}
            <span
              style={{ fontSize: "1.5rem", color: "green", fontWeight: "bold" }}
            >
              {result.totalFeeDkk} DKK
            </span>
          </p>
          {result.chargedPassages && result.chargedPassages.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <h4>Charged Passages</h4>
              <table
                style={{
                  borderCollapse: "collapse",
                  width: "100%",
                  fontSize: "0.85rem",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        border: "1px solid #ccc",
                        padding: "0.5rem",
                        textAlign: "left",
                      }}
                    >
                      Window
                    </th>
                    <th
                      style={{
                        border: "1px solid #ccc",
                        padding: "0.5rem",
                        textAlign: "right",
                      }}
                    >
                      Fee (DKK)
                    </th>
                    <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                      Triggering
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.chargedPassages.map((cp, i) => (
                    <tr key={i}>
                      <td
                        style={{ border: "1px solid #ccc", padding: "0.5rem" }}
                      >
                        {new Date(cp.windowStart).toLocaleTimeString("en-DK")} -{" "}
                        {new Date(cp.windowEnd).toLocaleTimeString("en-DK")}
                      </td>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          padding: "0.5rem",
                          textAlign: "right",
                        }}
                      >
                        {cp.appliedFeeDkk}
                      </td>
                      <td
                        style={{
                          border: "1px solid #ccc",
                          padding: "0.5rem",
                          fontSize: "0.8rem",
                        }}
                      >
                        {cp.triggeringTimestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
