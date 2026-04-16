"use client";

import TollCalculator from "../components/TollCalculator";

export default function HomePage() {
  return (
    <main className="section is-fullheight">
      <div className="container">
        <div className="mb-5">
          <h1 className="title">Toll Passage Manager</h1>
          <p className="subtitle">
            Track daily toll fees, stay under the 120 DKK cap, and review which
            passages were actually charged.
          </p>
        </div>
        <TollCalculator />
      </div>
    </main>
  );
}
