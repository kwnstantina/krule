import type { Metadata } from "next";
import React from "react";
import RuleBuilder from "../components/RuleBuilder";

export const metadata: Metadata = {
  title: "Rule builder — krule",
  description: "Build, test and export rules for the krule runtime engine.",
};

export default function BuilderPage() {
  return <RuleBuilder />;
}
