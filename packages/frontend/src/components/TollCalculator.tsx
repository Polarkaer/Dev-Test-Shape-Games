"use client";

import {
  Block,
  Box,
  Button,
  Container,
  Content,
  Control,
  Field,
  Input,
  Select,
  SubTitle,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Title,
  Tr,
} from "@allxsmith/bestax-bulma";
import { faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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

/*
  Assumptions and validation behavior:
  - Timezone evaluation is based on the timestamp's own timezone.
  - The local calendar day boundary is the date in the provided timezone.
  - Input may be unsorted; passages are sorted by instant before submission.
  - Malformed timestamps are rejected with a clear error.
  - Passages spanning multiple local dates are rejected.
*/

const vehicleTypes = [
  "car",
  "motorbike",
  "emergency",
  "tractor",
  "military",
];

const iconVehicle = (type: string) => {
  switch (type) {
    case "car":
      return "🚗";
    case "motorbike":
      return "🏍️";
    case "emergency":
      return "🚑";
    case "tractor":
      return "🚜";
    case "military":
      return "🪖";
  }
};

const parseIsoTimestamp = (timestamp: string) => {
  const parsed = new Date(timestamp);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const extractLocalDate = (timestamp: string) => {
  return timestamp.slice(0, 10);
};

const validatePassages = (passages: string[]) => {
  type InvalidPassage = {
    timestamp: string;
    index: number;
    error: string;
  };
  type ValidPassage = {
    timestamp: string;
    index: number;
    instant: number;
    localDate: string;
  };

  if (passages.length === 0) {
    return { sortedPassages: passages, error: "Please add at least one valid passage." };
  }

  const entries = passages.map<ValidPassage | InvalidPassage>((timestamp, index) => {
    const date = parseIsoTimestamp(timestamp);
    if (!date) {
      return { timestamp, index, error: `Malformed timestamp at passage ${index + 1}: ${timestamp}` };
    }

    return {
      timestamp,
      index,
      instant: date.getTime(),
      localDate: extractLocalDate(timestamp),
    };
  });

  const invalidEntry = entries.find((entry): entry is InvalidPassage =>
    "error" in entry,
  );
  if (invalidEntry) {
    return { sortedPassages: [], error: invalidEntry.error };
  }

  const validEntries = entries.filter((entry): entry is ValidPassage => !("error" in entry));

  const localDates = new Set(validEntries.map((entry) => entry.localDate));
  if (localDates.size > 1) {
    return {
      sortedPassages: [],
      error:
        "Passages span multiple local dates. Please submit passages for a single local calendar day.",
    };
  }

  const sortedPassages = validEntries
    .sort((a, b) => a.instant - b.instant)
    .map((entry) => entry.timestamp);

  return { sortedPassages, error: undefined };
};

export default function TollCalculator() {
  const [vehicleType, setVehicleType] = useState("");
  const [passageList, setPassageList] = useState<string[]>([]);
  const [date, setDate] = useState("2025-02-07");
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
    if (!parseIsoTimestamp(timestamp)) {
      setError(
        "Cannot add passage: invalid timestamp. Please select a valid date, time, and timezone.",
      );
      return;
    }

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

    const validation = validatePassages(passageList);
    if (validation.error) {
      setError(validation.error);
      return;
    }

    const sortedPassages = validation.sortedPassages;

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:4000/api/passages/daily-toll",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vehicleType,
            passages: sortedPassages.map((ts) => ({ timestamp: ts })),
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
      console.log("Passages:", sortedPassages);
      setLoading(false);
    }
  };

  return (
    <Container id="main-content">
      <Content className="main-title">
        <Title size="2">Toll Fee Calculator</Title>
        <SubTitle size="6">
          Review and manage congestion tax passages with hourly rules and fee
          caps.
        </SubTitle>
      </Content>
      <Box id="input-box" className="calculator-box">
        <Title size="5">Input</Title>
        <p className="help">
          Assumes timestamps are evaluated in the selected timezone. Passages must
          belong to a single local calendar day and are sorted before submission.
        </p>
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
                    {iconVehicle(type)} {type}
                  </option>
                ))}
              </Select>
            </Control>
          </Field>
          <Container display="flex" gap="4" flexWrap="wrap">

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
          </Container>
          <Button
            type="button"
            color="success"
            onClick={addPassage}
            className="button"
          >
            Add <FontAwesomeIcon icon={faPlus} />
          </Button>
          {error && <p className="has-text-danger mt-4">Error: {error}</p>}
        </form>
        <Button
          color="info"
          onClick={handleSubmit}
          disabled={loading || passageList.length === 0}
          className="button"
          style={{
            cursor: passageList.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Calculating..." : "Calculate Total Fee"}
        </Button>
      </Box>

      {/*Passage list content*/}
      {passageList.length > 0 && (
        <Box id="passage-list" className="calculator-box">
          <Content size="small">
            <Title display="flex" justifyContent="space-between" size="5">
              Passages{" "}
              <span className="has-text-info">{passageList.length}</span>
            </Title>
            <Table isBordered isStriped isFullwidth>
              <Thead>
                <Tr>
                  <Th>Timestamp</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {passageList.map((ts, i) => (
                  <Tr key={i}>
                    <Td>{ts}</Td>
                    <Td>
                      <Button
                        className="button remove"
                        type="button"
                        onClick={() => removePassage(i)}
                        color="danger"
                        size="small"
                      >
                        Remove
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Content>
        </Box>
      )}

      {/*Result content*/}
      {result && (
        <Box id="result" className="calculator-box">
          <Title size="5">Result</Title>
          <p>Date: {result.date}</p>
          <p>
            <strong>Total Fee:</strong>{" "}
            <span className="has-text-success">{result.totalFeeDkk} DKK</span>
          </p>
          {result.chargedPassages && result.chargedPassages.length > 0 && (
            <Content size="small">
              <Title size="6">Charged Passages</Title>
              <Table isBordered isStriped isFullwidth>
                <Thead>
                  <Tr>
                    <Th>Window</Th>
                    <Th>Fee (DKK)</Th>
                    <Th>Triggering</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {result.chargedPassages.map((cp, i) => (
                    <Tr key={i}>
                      <Td>
                        {new Date(cp.windowStart).toLocaleTimeString("en-DK")} -{" "}
                        {new Date(cp.windowEnd).toLocaleTimeString("en-DK")}
                      </Td>
                      <Td>{cp.appliedFeeDkk}</Td>
                      <Td>{cp.triggeringTimestamp}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Content>
          )}
        </Box>
      )}
    </Container>
  );
}
