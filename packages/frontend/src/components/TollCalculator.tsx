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
import { faTrash } from "@fortawesome/free-solid-svg-icons";
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
    <Container>
      <Block >
        <Container display="flex" justifyContent="space-around" className="columns is-3">
          <Box id="1">
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
              <Button type="button" onClick={addPassage} className="button">
                Add
              </Button>
              {error && <p className="has-text-danger">Error: {error}</p>}
            </form>
          </Box>
          {/*Passage list content*/}
          {passageList.length > 0 && (
            <Box id="2">
              <Title size="5">Passages ({passageList.length})</Title>
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
            </Box>
          )}
        </Container>
      </Block>

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

      {/*Result content*/}
      {result && (
        <Box bgColor="black-ter" className="content">
          <Title size="5">Result</Title>
          <p>Date: {result.date}</p>
          <p>
            <strong>Total Fee:</strong>{" "}
            <span className="has-text-success">{result.totalFeeDkk} DKK</span>
          </p>
          {result.chargedPassages && result.chargedPassages.length > 0 && (
            <Content>
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
